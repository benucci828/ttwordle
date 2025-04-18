import requests
from bs4 import BeautifulSoup
import json
import time

base_url = "https://www.techtarget.com/whatis/definitions/"
letters = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

# Fake a browser (Safari on macOS)
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/605.1.15 (KHTML, like Gecko) "
                  "Version/15.1 Safari/605.1.15"
}

def get_term_links(url):
    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if "/definition/" in href and href.startswith("https://"):
                links.append(href)
        return list(set(links))
    except Exception as e:
        print(f"❌ Error fetching {url}: {e}")
        return []

def extract_definition_data(url):
    term = url.rstrip('/').split('/')[-1].lower()
    term = term.replace('-', '')

    if len(term) != 5:
        return None

    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        p = soup.find('p')
        if not p:
            return None
        intro = p.get_text(strip=True)
        return {
            "term": term,
            "definition_url": url,
            "intro": intro
        }
    except Exception as e:
        print(f"❌ Error extracting from {url}: {e}")
        return None

# Crawl A–Z glossary index pages
all_links = set()
for letter in letters:
    print(f"🔤 Scanning glossary index: {letter}")
    index_url = f"{base_url}{letter}"
    links = get_term_links(index_url)
    all_links.update(links)
    time.sleep(1)

print(f"📚 Total unique glossary links found: {len(all_links)}")

# Extract and filter only valid 5-letter terms
glossary_data = []
for i, link in enumerate(all_links):
    print(f"[{i+1}/{len(all_links)}] Checking: {link}")
    entry = extract_definition_data(link)
    if entry:
        glossary_data.append(entry)
    time.sleep(0.5)

# Save to JSON
with open("techterms.json", "w", encoding="utf-8") as f:
    json.dump(glossary_data, f, indent=2)

print(f"✅ Saved {len(glossary_data)} 5-letter terms to techterms.json")
