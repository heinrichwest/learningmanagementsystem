# How to Run Semrush Analysis for elearning.co.za

This guide explains how to use the analysis tools to generate a real SEO analysis report for elearning.co.za using your Semrush API key.

## Prerequisites

1. **Valid Semrush API Key** (you'll need to regenerate this for security)
2. **Node.js** installed on your system
3. **API Credits** available in your Semrush account

## Setup Instructions

### 1. Install Dependencies

```bash
cd C:\Websites\learningmanagementsystem
npm install axios fs
```

### 2. Set Environment Variable

**Windows Command Prompt:**
```cmd
set SEMRUSH_API_KEY=your_new_api_key_here
```

**Windows PowerShell:**
```powershell
$env:SEMRUSH_API_KEY="your_new_api_key_here"
```

**Or create a .env file:**
```
SEMRUSH_API_KEY=your_new_api_key_here
```

### 3. Run the Analysis

```bash
node analysis-script.js
```

## What the Script Does

The analysis script will:

1. **Fetch Domain Overview** - Basic traffic and ranking metrics
2. **Analyze Keywords** - Top performing keywords and positions
3. **Check Competitors** - Competitive landscape analysis
4. **Review Backlinks** - Link profile assessment
5. **Generate Recommendations** - Actionable SEO advice
6. **Create Report** - Comprehensive markdown document

## Expected Output

The script will generate a file named:
`elearning-co-za-seo-analysis-[date].md`

This report will include:
- Executive summary with key findings
- Detailed keyword analysis
- Competitive intelligence
- Backlink profile assessment
- Technical SEO recommendations
- Content strategy suggestions
- Implementation roadmap

## API Usage & Costs

Each analysis will consume approximately:
- 5 API units for domain overview
- 10 API units for keyword analysis  
- 15 API units for competitor data
- 10 API units for backlinks data
- **Total: ~40 API units**

## Troubleshooting

### Common Issues

1. **API Key Error**
   ```
   Error: 401 Unauthorized
   ```
   - Solution: Regenerate your Semrush API key and update the environment variable

2. **Insufficient Credits**
   ```
   Error: 403 Forbidden - Insufficient units
   ```
   - Solution: Purchase additional API units in your Semrush account

3. **Domain Not Found**
   ```
   Error: No data available for domain
   ```
   - Solution: The domain may be too small or not indexed by Semrush

4. **Rate Limiting**
   ```
   Error: 429 Too Many Requests
   ```
   - Solution: Wait a few minutes and retry

### Manual Testing

You can test individual API calls using curl:

```bash
# Test domain overview
curl "https://api.semrush.com/?type=domain_overview&key=YOUR_API_KEY&domain=elearning.co.za&database=us"

# Test keyword analysis
curl "https://api.semrush.com/?type=domain_organic&key=YOUR_API_KEY&domain=elearning.co.za&database=us&display_limit=10"
```

## Alternative: Manual Analysis

If you prefer to run the analysis manually:

### 1. Use the Web Interface

Visit: `C:\Websites\learningmanagementsystem\features\seo-analytics.html`

1. Open the page in your browser
2. Enter "elearning.co.za" in the domain input
3. Click "Analyze"
4. Export the results

### 2. Use Semrush Directly

1. Log into your Semrush account
2. Enter "elearning.co.za" in the search
3. Review the Domain Overview, Keywords, and Backlinks tabs
4. Export data as needed

## Security Recommendations

1. **Regenerate API Key** - Since it was shared in conversation
2. **Use Environment Variables** - Never hardcode API keys
3. **Restrict API Access** - Set up IP restrictions if possible
4. **Monitor Usage** - Track API unit consumption

## Next Steps

After generating the report:

1. **Review Findings** - Analyze the key insights and recommendations
2. **Prioritize Actions** - Focus on high-impact, low-effort improvements first
3. **Implement Changes** - Start with technical SEO fixes
4. **Monitor Progress** - Re-run analysis monthly to track improvements
5. **Adjust Strategy** - Refine approach based on results

## Support

If you encounter issues:

1. Check the Semrush API documentation: https://developer.semrush.com/api/
2. Review the error messages in the console output
3. Verify your API key and credit balance
4. Test with a smaller domain first to ensure setup is correct

---

**Important:** This analysis will consume API credits from your Semrush account. Make sure you have sufficient units available before running the full analysis.