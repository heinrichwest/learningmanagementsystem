# Semrush API Integration Guide for Learning Management System

This document provides comprehensive guidance for integrating the Semrush API into the Learning Management System for SEO analytics and competitive intelligence features.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [API Versions and Types](#api-versions-and-types)
4. [Key Endpoints](#key-endpoints)
5. [Request/Response Format](#requestresponse-format)
6. [Code Examples](#code-examples)
7. [Rate Limits and Best Practices](#rate-limits-and-best-practices)
8. [Error Handling](#error-handling)
9. [Integration with TAP Dashboard](#integration-with-tap-dashboard)

## API Overview

The Semrush API provides access to extensive SEO and digital marketing data including:

- **27+ billion keywords** across 142 geographical databases
- **808,000+ domains** with competitive intelligence
- **43+ trillion backlinks** for link analysis
- **Historical data** dating back to 2012
- **16 languages** for international SEO

### Prerequisites

- **Semrush Business Subscription** (required for Standard API)
- **API Key** (found in Subscription Info under My Profile)
- **API Units** (purchased separately based on usage)

## Authentication

### API Key Authentication

All requests require your API key as a parameter:

```
https://api.semrush.com/?type=domain_overview&key=YOUR_API_KEY&domain=example.com
```

**⚠️ Security Notice:** Store your API key as an environment variable, never in code.

### Environment Setup

```bash
# In your .env file
SEMRUSH_API_KEY=your_api_key_here
```

## API Versions and Types

### Standard API (Version 3)
The most feature-complete version currently available:

- **Analytics API**: Domain analysis, keyword research, backlinks
- **Projects API**: Position tracking, site audits
- **Domain Reports**: Overview, organic positions, paid ads
- **Keyword Reports**: Overview, related keywords, difficulty

### Trends API 
Separate subscription for traffic and audience insights:

- **Traffic Summary**: Estimated visits, unique visitors, bounce rate
- **Daily Traffic**: Day-by-day traffic breakdown  
- **Traffic Sources**: Direct, referral, search, social, email, paid

### Version 4 (Beta)
Next-generation API with OAuth 2.0 and unified format (limited features currently).

## Key Endpoints

### Domain Analytics

#### Domain Overview
```
GET https://api.semrush.com/
?type=domain_overview
&key={API_KEY}
&domain={DOMAIN}
&database={DATABASE}
```

**Parameters:**
- `domain`: Target domain (required)
- `database`: Geographic database (e.g., 'us', 'uk', 'de')
- `export_columns`: Specific metrics to return

**Response Fields:**
- `Dn`: Domain name
- `Cr`: Country rank
- `Or`: Organic keywords count
- `Ot`: Organic traffic
- `Ac`: Adwords keywords count
- `At`: Adwords traffic

#### Organic Research Positions
```
GET https://api.semrush.com/
?type=domain_organic
&key={API_KEY}
&domain={DOMAIN}
&database={DATABASE}
```

### Keyword Analytics

#### Keyword Overview
```
GET https://api.semrush.com/
?type=phrase_this
&key={API_KEY}
&phrase={KEYWORD}
&database={DATABASE}
```

#### Related Keywords
```
GET https://api.semrush.com/
?type=phrase_related
&key={API_KEY}
&phrase={KEYWORD}
&database={DATABASE}
```

### Backlinks Analysis

#### Backlinks Overview
```
GET https://api.semrush.com/
?type=backlinks_overview
&key={API_KEY}
&target={DOMAIN}
```

#### Referring Domains
```
GET https://api.semrush.com/
?type=backlinks_refdomains
&key={API_KEY}
&target={DOMAIN}
```

## Request/Response Format

### Standard Request Structure

```javascript
const baseUrl = 'https://api.semrush.com/';
const params = {
  type: 'domain_overview',
  key: process.env.SEMRUSH_API_KEY,
  domain: 'example.com',
  database: 'us',
  export_columns: 'Dn,Cr,Or,Ot'
};
```

### Response Format

Responses are typically in CSV format by default:

```
Dn;Cr;Or;Ot
example.com;1234;5678;123456
```

JSON format can be requested by adding `&export_format=json`:

```json
{
  "data": [
    {
      "Dn": "example.com",
      "Cr": "1234", 
      "Or": "5678",
      "Ot": "123456"
    }
  ]
}
```

## Code Examples

### Basic Domain Analysis (Node.js)

```javascript
const axios = require('axios');

class SemrushAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.semrush.com/';
  }

  async getDomainOverview(domain, database = 'us') {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          type: 'domain_overview',
          key: this.apiKey,
          domain: domain,
          database: database,
          export_format: 'json'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Semrush API Error: ${error.message}`);
    }
  }

  async getOrganicKeywords(domain, limit = 100, database = 'us') {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          type: 'domain_organic',
          key: this.apiKey,
          domain: domain,
          database: database,
          display_limit: limit,
          export_format: 'json'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Semrush API Error: ${error.message}`);
    }
  }

  async getKeywordOverview(keyword, database = 'us') {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          type: 'phrase_this',
          key: this.apiKey,
          phrase: keyword,
          database: database,
          export_format: 'json'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Semrush API Error: ${error.message}`);
    }
  }
}

// Usage Example
const semrush = new SemrushAPI(process.env.SEMRUSH_API_KEY);

async function analyzeDomain(domain) {
  try {
    const overview = await semrush.getDomainOverview(domain);
    const keywords = await semrush.getOrganicKeywords(domain, 50);
    
    console.log('Domain Overview:', overview);
    console.log('Top Keywords:', keywords);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzeDomain('example.com');
```

### Integration with Express.js

```javascript
const express = require('express');
const app = express();

app.get('/api/seo-analysis/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const semrush = new SemrushAPI(process.env.SEMRUSH_API_KEY);
    
    const [overview, keywords, backlinks] = await Promise.all([
      semrush.getDomainOverview(domain),
      semrush.getOrganicKeywords(domain, 20),
      semrush.getBacklinksOverview(domain)
    ]);
    
    res.json({
      domain,
      overview,
      topKeywords: keywords,
      backlinksData: backlinks,
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Rate Limits and Best Practices

### API Units System

Semrush uses a **credits/units system** rather than rate limits:

- Each API call consumes a specific number of units
- Units are purchased as part of your subscription
- Different endpoints consume different amounts of units

### Best Practices

1. **Caching**: Store results to avoid redundant API calls
2. **Batch Processing**: Group similar requests when possible
3. **Error Handling**: Implement retry logic with exponential backoff
4. **Monitoring**: Track API unit consumption

```javascript
// Example caching implementation
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

async function getCachedData(key, fetchFunction) {
  const cached = cache.get(key);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFunction();
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

## Error Handling

### Common Error Codes

```javascript
const handleSemrushError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Bad Request - Check your parameters';
      case 401:
        return 'Unauthorized - Invalid API key';
      case 403:
        return 'Forbidden - Insufficient permissions or units';
      case 404:
        return 'Not Found - Endpoint or data not available';
      case 500:
        return 'Server Error - Try again later';
      default:
        return `HTTP Error: ${error.response.status}`;
    }
  }
  return 'Network Error';
};
```

## Integration with Learning Management System Dashboard

### Dashboard Widget Example

```javascript
// SEO Dashboard Widget for Learning Management System
class SEOAnalyticsWidget {
  constructor(containerId, apiKey) {
    this.container = document.getElementById(containerId);
    this.semrushAPI = new SemrushAPI(apiKey);
  }

  async render(domain) {
    try {
      this.showLoading();
      
      const data = await this.semrushAPI.getDomainOverview(domain);
      
      this.container.innerHTML = `
        <div class="seo-widget">
          <h3>SEO Overview for ${domain}</h3>
          <div class="metrics">
            <div class="metric">
              <span class="value">${data.Or}</span>
              <span class="label">Organic Keywords</span>
            </div>
            <div class="metric">
              <span class="value">${data.Ot}</span>
              <span class="label">Organic Traffic</span>
            </div>
            <div class="metric">
              <span class="value">${data.Cr}</span>
              <span class="label">Country Rank</span>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      this.showError(error.message);
    }
  }

  showLoading() {
    this.container.innerHTML = '<div class="loading">Loading SEO data...</div>';
  }

  showError(message) {
    this.container.innerHTML = `<div class="error">Error: ${message}</div>`;
  }
}
```

### CSS for SEO Widget

```css
.seo-widget {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.seo-widget h3 {
  margin-bottom: 20px;
  color: #333;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.metric {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.metric .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.metric .label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}
```

## Security Considerations

1. **API Key Protection**: Never expose API keys in client-side code
2. **Environment Variables**: Store sensitive data in environment variables
3. **Proxy Endpoints**: Create server-side endpoints to proxy API requests
4. **Input Validation**: Validate and sanitize all user inputs
5. **Rate Limiting**: Implement client-side rate limiting to prevent abuse

## Conclusion

The Semrush API provides powerful SEO and competitive intelligence data that can significantly enhance the Learning Management System platform. By following this guide, you can implement robust SEO analytics features while maintaining security and performance best practices.

For the most up-to-date API documentation, always refer to the official Semrush Developer Documentation at https://developer.semrush.com/api/

---

**Last Updated**: December 2024  
**API Version**: Semrush API v3/v4  
**Learning Management System Version**: 1.0