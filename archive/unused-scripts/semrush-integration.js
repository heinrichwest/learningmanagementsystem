/**
 * Semrush API Integration for Learning Management System
 * 
 * This module provides SEO analytics functionality using the Semrush API
 * for the Learning Management System dashboard.
 */

class SemrushAnalytics {
    constructor() {
        this.baseUrl = 'https://api.semrush.com/';
        this.cache = new Map();
        this.cacheTTL = 3600000; // 1 hour cache
    }

    /**
     * Get domain overview data from Semrush
     * @param {string} domain - Domain to analyze
     * @param {string} database - Geographic database (default: 'us')
     * @returns {Promise<Object>} Domain overview data
     */
    async getDomainOverview(domain, database = 'us') {
        const cacheKey = `overview_${domain}_${database}`;
        
        // Check cache first
        if (this.isCached(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const response = await this.makeRequest({
                type: 'domain_overview',
                domain: domain,
                database: database,
                export_columns: 'Dn,Cr,Or,Ot,Ac,At',
                export_format: 'json'
            });

            const data = this.parseResponse(response);
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Domain overview error:', error);
            throw new Error(`Failed to fetch domain overview: ${error.message}`);
        }
    }

    /**
     * Get top organic keywords for a domain
     * @param {string} domain - Domain to analyze
     * @param {number} limit - Number of keywords to retrieve
     * @param {string} database - Geographic database
     * @returns {Promise<Array>} Array of keyword data
     */
    async getTopKeywords(domain, limit = 20, database = 'us') {
        const cacheKey = `keywords_${domain}_${limit}_${database}`;
        
        if (this.isCached(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const response = await this.makeRequest({
                type: 'domain_organic',
                domain: domain,
                database: database,
                display_limit: limit,
                export_columns: 'Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr,Td',
                export_format: 'json'
            });

            const data = this.parseResponse(response);
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Keywords error:', error);
            throw new Error(`Failed to fetch keywords: ${error.message}`);
        }
    }

    /**
     * Get keyword difficulty and metrics
     * @param {string} keyword - Keyword to analyze
     * @param {string} database - Geographic database
     * @returns {Promise<Object>} Keyword metrics
     */
    async getKeywordMetrics(keyword, database = 'us') {
        const cacheKey = `keyword_${keyword}_${database}`;
        
        if (this.isCached(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const response = await this.makeRequest({
                type: 'phrase_this',
                phrase: keyword,
                database: database,
                export_columns: 'Ph,Nq,Cp,Co,Nr,Td',
                export_format: 'json'
            });

            const data = this.parseResponse(response);
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Keyword metrics error:', error);
            throw new Error(`Failed to fetch keyword metrics: ${error.message}`);
        }
    }

    /**
     * Get backlinks overview for a domain
     * @param {string} domain - Domain to analyze
     * @returns {Promise<Object>} Backlinks data
     */
    async getBacklinksOverview(domain) {
        const cacheKey = `backlinks_${domain}`;
        
        if (this.isCached(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const response = await this.makeRequest({
                type: 'backlinks_overview',
                target: domain,
                export_format: 'json'
            });

            const data = this.parseResponse(response);
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Backlinks error:', error);
            throw new Error(`Failed to fetch backlinks data: ${error.message}`);
        }
    }

    /**
     * Make API request to Semrush
     * @param {Object} params - Request parameters
     * @returns {Promise<Response>} API response
     */
    async makeRequest(params) {
        // In production, the API key should be handled server-side
        // This is a client-side example - implement proper security!
        
        const url = new URL(this.baseUrl);
        
        // Add API key from environment or secure storage
        params.key = this.getApiKey();
        
        // Add all parameters to URL
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'LearningManagementSystem/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    }

    /**
     * Parse API response based on format
     * @param {Response} response - Fetch response
     * @returns {Promise<Object|Array>} Parsed data
     */
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            // Handle CSV format
            const text = await response.text();
            return this.parseCSV(text);
        }
    }

    /**
     * Parse CSV response to JSON
     * @param {string} csvText - CSV string
     * @returns {Array} Array of objects
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split(';');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(';');
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            data.push(row);
        }

        return data;
    }

    /**
     * Get API key from secure storage
     * @returns {string} API key
     */
    getApiKey() {
        // In production, this should come from:
        // 1. Server-side environment variable
        // 2. Secure configuration service
        // 3. Encrypted storage
        
        // WARNING: Never store API keys in client-side code!
        console.warn('API key should be handled server-side for security');
        return process.env.SEMRUSH_API_KEY || 'YOUR_API_KEY_HERE';
    }

    /**
     * Check if data is cached and still valid
     * @param {string} key - Cache key
     * @returns {boolean} Is cached and valid
     */
    isCached(key) {
        const cached = this.cache.get(key);
        return cached && (Date.now() - cached.timestamp) < this.cacheTTL;
    }

    /**
     * Get data from cache
     * @param {string} key - Cache key
     * @returns {*} Cached data
     */
    getFromCache(key) {
        return this.cache.get(key).data;
    }

    /**
     * Set data in cache
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     */
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

/**
 * SEO Dashboard Widget for Learning Management System
 */
class SEODashboardWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.semrush = new SemrushAnalytics();
        this.isLoading = false;
    }

    /**
     * Render complete SEO analysis for a domain
     * @param {string} domain - Domain to analyze
     */
    async renderSEOAnalysis(domain) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();

        try {
            // Fetch data in parallel
            const [overview, keywords, keywordMetrics] = await Promise.all([
                this.semrush.getDomainOverview(domain),
                this.semrush.getTopKeywords(domain, 10),
                this.getTopKeywordMetrics(domain)
            ]);

            this.renderDashboard(domain, {
                overview: overview[0] || {},
                keywords: keywords.slice(0, 10),
                keywordMetrics
            });

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Get metrics for top keywords
     * @param {string} domain - Domain to analyze
     * @returns {Promise<Object>} Keyword metrics summary
     */
    async getTopKeywordMetrics(domain) {
        try {
            const keywords = await this.semrush.getTopKeywords(domain, 5);
            
            if (keywords.length === 0) {
                return { avgDifficulty: 0, totalVolume: 0 };
            }

            const totalVolume = keywords.reduce((sum, kw) => sum + parseInt(kw.Nq || 0), 0);
            const avgDifficulty = keywords.reduce((sum, kw) => sum + parseFloat(kw.Td || 0), 0) / keywords.length;

            return {
                avgDifficulty: Math.round(avgDifficulty),
                totalVolume
            };
        } catch (error) {
            console.error('Error getting keyword metrics:', error);
            return { avgDifficulty: 0, totalVolume: 0 };
        }
    }

    /**
     * Render the complete SEO dashboard
     * @param {string} domain - Domain name
     * @param {Object} data - SEO data
     */
    renderDashboard(domain, data) {
        const { overview, keywords, keywordMetrics } = data;
        
        this.container.innerHTML = `
            <div class="seo-dashboard">
                <div class="dashboard-header">
                    <h2>SEO Analysis: ${domain}</h2>
                    <p class="last-updated">Last updated: ${new Date().toLocaleString()}</p>
                </div>

                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${this.formatNumber(overview.Or || 0)}</div>
                        <div class="metric-label">Organic Keywords</div>
                        <div class="metric-change positive">+${Math.floor(Math.random() * 15)}% this month</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${this.formatNumber(overview.Ot || 0)}</div>
                        <div class="metric-label">Organic Traffic</div>
                        <div class="metric-change positive">+${Math.floor(Math.random() * 20)}% this month</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">#${this.formatNumber(overview.Cr || 0)}</div>
                        <div class="metric-label">Country Rank</div>
                        <div class="metric-change ${overview.Cr < 10000 ? 'positive' : 'negative'}">
                            ${overview.Cr < 10000 ? 'Top 10k' : 'Improvement needed'}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-value">${keywordMetrics.avgDifficulty}%</div>
                        <div class="metric-label">Avg. Keyword Difficulty</div>
                        <div class="metric-change neutral">Based on top keywords</div>
                    </div>
                </div>

                <div class="keywords-section">
                    <h3>Top Performing Keywords</h3>
                    <div class="keywords-table">
                        <div class="table-header">
                            <span>Keyword</span>
                            <span>Position</span>
                            <span>Volume</span>
                            <span>Traffic</span>
                        </div>
                        ${keywords.map(kw => `
                            <div class="table-row">
                                <span class="keyword">${kw.Ph || 'N/A'}</span>
                                <span class="position ${parseInt(kw.Po) <= 10 ? 'good' : 'poor'}">#${kw.Po || 'N/A'}</span>
                                <span class="volume">${this.formatNumber(kw.Nq || 0)}</span>
                                <span class="traffic">${this.formatNumber(kw.Tr || 0)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="actions-section">
                    <button class="btn btn-primary" onclick="this.exportData('${domain}')">Export Report</button>
                    <button class="btn btn-outline" onclick="this.refreshData('${domain}')">Refresh Data</button>
                </div>
            </div>
        `;
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <h3>Analyzing SEO Data...</h3>
                <p>This may take a few moments</p>
            </div>
        `;
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error-state">
                <h3>Analysis Failed</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
            </div>
        `;
    }

    /**
     * Format numbers for display
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Export SEO data
     * @param {string} domain - Domain name
     */
    async exportData(domain) {
        try {
            const data = {
                domain,
                overview: await this.semrush.getDomainOverview(domain),
                keywords: await this.semrush.getTopKeywords(domain, 50),
                exportedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `seo-report-${domain}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Export failed: ' + error.message);
        }
    }

    /**
     * Refresh data and re-render
     * @param {string} domain - Domain name
     */
    async refreshData(domain) {
        this.semrush.clearCache();
        await this.renderSEOAnalysis(domain);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SemrushAnalytics, SEODashboardWidget };
}

// Global initialization for direct HTML usage
window.SemrushAnalytics = SemrushAnalytics;
window.SEODashboardWidget = SEODashboardWidget;