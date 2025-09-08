# Firecrawl API Setup

## API Key
```
fc-472bddcc815f4bae8e3283aebda1c2a3
```

## Direct API Usage

### Base URL
```
https://api.firecrawl.dev/v1
```

### Common Endpoints

#### 1. Scrape a Single URL
```bash
curl -X POST "https://api.firecrawl.dev/v1/scrape" \
  -H "Authorization: Bearer fc-472bddcc815f4bae8e3283aebda1c2a3" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "html"]
  }'
```

#### 2. Crawl Multiple Pages
```bash
curl -X POST "https://api.firecrawl.dev/v1/crawl" \
  -H "Authorization: Bearer fc-472bddcc815f4bae8e3283aebda1c2a3" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "limit": 10,
    "formats": ["markdown"]
  }'
```

#### 3. Check Crawl Status
```bash
curl -X GET "https://api.firecrawl.dev/v1/crawl/{job_id}" \
  -H "Authorization: Bearer fc-472bddcc815f4bae8e3283aebda1c2a3"
```

### JavaScript Example
```javascript
const FIRECRAWL_API_KEY = 'fc-472bddcc815f4bae8e3283aebda1c2a3';
const BASE_URL = 'https://api.firecrawl.dev/v1';

async function scrapeUrl(url) {
  const response = await fetch(`${BASE_URL}/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      formats: ['markdown', 'html']
    })
  });
  
  return await response.json();
}
```

### Python Example
```python
import requests

FIRECRAWL_API_KEY = 'fc-472bddcc815f4bae8e3283aebda1c2a3'
BASE_URL = 'https://api.firecrawl.dev/v1'

def scrape_url(url):
    headers = {
        'Authorization': f'Bearer {FIRECRAWL_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'url': url,
        'formats': ['markdown', 'html']
    }
    
    response = requests.post(f'{BASE_URL}/scrape', headers=headers, json=data)
    return response.json()
```

## Environment Variable Setup

### Windows (PowerShell)
```powershell
$env:FIRECRAWL_API_KEY = "fc-472bddcc815f4bae8e3283aebda1c2a3"
```

### Windows (Command Prompt)
```cmd
set FIRECRAWL_API_KEY=fc-472bddcc815f4bae8e3283aebda1c2a3
```

### Linux/Mac
```bash
export FIRECRAWL_API_KEY=fc-472bddcc815f4bae8e3283aebda1c2a3
```

## API Documentation
- Official Docs: https://docs.firecrawl.dev/
- API Reference: https://docs.firecrawl.dev/api-reference/