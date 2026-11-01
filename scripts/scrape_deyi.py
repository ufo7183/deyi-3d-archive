#!/usr/bin/env python3
"""Scrape all 22 year pages from de-yi.com.tw, extract project info and images,
download best-quality photos, convert to WebP, build manifest.json."""
import io, json, re, time, sys
from pathlib import Path
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageOps

BASE_URL = "http://www.de-yi.com.tw/"
YEARS = list(range(2023, 2001, -1))
DEST = Path(__file__).resolve().parent.parent / "assets" / "official"
DEST.mkdir(parents=True, exist_ok=True)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
session = requests.Session()
session.headers.update({"User-Agent": UA})

manifest = {}
stats = {"years_ok": 0, "years_fail": 0, "projects": 0, "images": 0}


def slugify(name):
    from pypinyin import lazy_pinyin
    slug = "-".join(lazy_pinyin(name))
    slug = re.sub(r"[^a-z0-9-]", "", slug.lower())
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug or "project"


def slugify_simple(name):
    slug = re.sub(r"[^\w一-鿿]", "-", name)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug[:30] or "project"


def download_and_convert(url, dest_path, referer, max_long_edge=1600):
    try:
        res = session.get(url, timeout=15, headers={"Referer": referer})
        res.raise_for_status()
        if len(res.content) < 2000:
            return None
        im = Image.open(io.BytesIO(res.content))
        im = ImageOps.exif_transpose(im).convert("RGB")
        if im.width < 200 or im.height < 200:
            return None
        im.thumbnail((max_long_edge, max_long_edge), Image.Resampling.LANCZOS)
        im.save(str(dest_path), "WEBP", quality=88, method=5)
        return {"width": im.width, "height": im.height}
    except Exception as e:
        print(f"  SKIP {url}: {e}", flush=True)
        return None


def try_image_urls(base_url, year, letter, page_url):
    """Try multiple image URL patterns, return the best one found."""
    candidates = []
    for num in ["3b", "4b", "5b", "3", "1", "2"]:
        for ext in [".jpg", ".png", ".jpeg"]:
            candidates.append(f"Gallery/images/{year}/{letter}/{num}{ext}")
    for c in candidates:
        url = urljoin(base_url, c)
        try:
            head = session.head(url, timeout=8, headers={"Referer": page_url}, allow_redirects=True)
            if head.status_code == 200:
                ct = head.headers.get("content-type", "")
                cl = int(head.headers.get("content-length", "0"))
                if "image" in ct and cl > 3000:
                    return url
        except:
            pass
    return None


def parse_year_page(year):
    page_url = f"{BASE_URL}{year}.htm"
    try:
        res = session.get(page_url, timeout=12)
        if not res.ok or len(res.content) < 500:
            print(f"{year}: page fetch failed (HTTP {res.status_code})", flush=True)
            return None
    except Exception as e:
        print(f"{year}: {e}", flush=True)
        return None

    res.encoding = res.apparent_encoding or "utf-8"
    soup = BeautifulSoup(res.text, "html.parser")

    h2 = soup.find("h2")
    year_subtitle = ""
    if h2:
        span = h2.find("span")
        if span:
            year_subtitle = span.get_text(strip=True)

    projects = []
    blocks = soup.find_all("div", class_="col-sm-4")
    for block in blocks:
        h4 = block.find("h4")
        if not h4:
            continue

        name_parts = list(h4.children)
        project_name = ""
        project_desc = ""
        for part in name_parts:
            if hasattr(part, "name") and part.name == "span":
                project_desc = part.get_text(strip=True)
            elif isinstance(part, str):
                project_name += part.strip()
            elif hasattr(part, "get_text"):
                txt = part.get_text(strip=True)
                if not project_name:
                    project_name = txt

        project_name = project_name.strip()
        if not project_name:
            project_name = h4.get_text(strip=True).split()[0] if h4.get_text(strip=True) else ""

        imgs_in_block = block.find_all("img")
        image_urls = []
        for img in imgs_in_block:
            darkbox = img.get("data-darkbox", "").strip()
            src = img.get("src", "").strip()
            if darkbox and not darkbox.startswith("data:"):
                image_urls.append(urljoin(page_url, darkbox))
            elif src and not src.startswith("data:") and src:
                image_urls.append(urljoin(page_url, src))

        image_urls = [u for u in image_urls if u and "logo" not in u.lower()
                      and "icon" not in u.lower() and "btn" not in u.lower()
                      and "facebook" not in u.lower() and "counter" not in u.lower()]
        seen = set()
        unique_urls = []
        for u in image_urls:
            if u not in seen:
                seen.add(u)
                unique_urls.append(u)

        if project_name:
            projects.append({
                "name": project_name,
                "description": project_desc,
                "image_urls": unique_urls,
            })

    return {
        "year": year,
        "subtitle": year_subtitle,
        "projects": projects,
        "page_url": page_url,
    }


def process_year(year_data):
    year = year_data["year"]
    projects = year_data["projects"]
    folder = DEST / str(year)
    folder.mkdir(exist_ok=True)

    year_entry = {
        "subtitle": year_data["subtitle"],
        "official_page": year_data["page_url"],
        "projects": [],
        "gallery": [],
        "cover": None,
    }

    first_image_path = None
    photo_index = 0

    for proj in projects:
        proj_images = []
        proj_slug = slugify_simple(proj["name"])

        for i, url in enumerate(proj["image_urls"]):
            photo_index += 1
            fname = f"{proj_slug}-{i+1:02}.webp"
            dest_path = folder / fname
            result = download_and_convert(url, dest_path, year_data["page_url"])
            if result:
                rel_path = f"assets/official/{year}/{fname}"
                img_entry = {
                    "src": rel_path,
                    "source": url,
                    "width": result["width"],
                    "height": result["height"],
                    "project": proj["name"],
                }
                proj_images.append(img_entry)
                year_entry["gallery"].append(img_entry)
                if first_image_path is None:
                    first_image_path = rel_path
                stats["images"] += 1
                time.sleep(0.15)

        if not proj_images and proj["image_urls"]:
            for url in proj["image_urls"]:
                src_url = url.replace("/3b.", "/3.").replace("/4b.", "/4.")
                photo_index += 1
                fname = f"{proj_slug}-{i+1:02}.webp"
                dest_path = folder / fname
                result = download_and_convert(src_url, dest_path, year_data["page_url"])
                if result:
                    rel_path = f"assets/official/{year}/{fname}"
                    img_entry = {
                        "src": rel_path,
                        "source": src_url,
                        "width": result["width"],
                        "height": result["height"],
                        "project": proj["name"],
                    }
                    proj_images.append(img_entry)
                    year_entry["gallery"].append(img_entry)
                    if first_image_path is None:
                        first_image_path = rel_path
                    stats["images"] += 1
                    time.sleep(0.15)

        year_entry["projects"].append({
            "name": proj["name"],
            "description": proj["description"],
            "images": [img["src"] for img in proj_images],
        })
        if proj["name"]:
            stats["projects"] += 1

    if first_image_path:
        year_entry["cover"] = first_image_path

    return year_entry


print("=== DE-YI Official Photo Scraper ===", flush=True)
print(f"Target: {len(YEARS)} years, {BASE_URL}", flush=True)
print(f"Output: {DEST}", flush=True)
print()

for year in YEARS:
    print(f"--- {year} ---", flush=True)
    data = parse_year_page(year)
    if data is None:
        stats["years_fail"] += 1
        continue

    proj_names = [p["name"] for p in data["projects"]]
    print(f"  Subtitle: {data['subtitle']}", flush=True)
    print(f"  Projects: {proj_names}", flush=True)
    total_imgs = sum(len(p["image_urls"]) for p in data["projects"])
    print(f"  Image URLs found: {total_imgs}", flush=True)

    year_entry = process_year(data)
    dl_count = len(year_entry["gallery"])
    print(f"  Downloaded: {dl_count} images", flush=True)

    if year_entry["projects"] or year_entry["gallery"]:
        manifest[str(year)] = year_entry
        stats["years_ok"] += 1
    else:
        stats["years_fail"] += 1

    time.sleep(0.3)

manifest_path = DEST / "manifest.json"
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print()
print("=== COMPLETE ===", flush=True)
print(f"Years OK: {stats['years_ok']}", flush=True)
print(f"Years Failed: {stats['years_fail']}", flush=True)
print(f"Projects found: {stats['projects']}", flush=True)
print(f"Images downloaded: {stats['images']}", flush=True)
print(f"Manifest: {manifest_path}", flush=True)
