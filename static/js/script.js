document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quoteForm');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const resultsContainer = document.getElementById('resultsContainer');
    const timestampDisplay = document.getElementById('timestampDisplay');
    const quotesWithoutSearchContainer = document.getElementById('quotesWithoutSearchContainer');
    const quotesWithSearchContainer = document.getElementById('quotesWithSearchContainer');
    
    // History elements
    const historyBtn = document.getElementById('historyBtn');
    const historyModal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    const closeHistoryBtn = historyModal.querySelector('.close');
    
    // Detail modal elements
    const detailModal = document.getElementById('detailModal');
    const detailContent = document.getElementById('detailContent');
    const closeDetailBtn = detailModal.querySelector('.detail-close');
    
    // Form submission
    quoteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(quoteForm);
        const articleTopic = formData.get('article_topic').trim();
        
        // Validate input
        if (!articleTopic) {
            alert('Please enter an article topic');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            // Send request to backend
            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Error generating quotes');
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display results
            displayResults(data);
            
            // Show results container
            resultsContainer.classList.remove('hidden');
            
            // Scroll to results
            resultsContainer.scrollIntoView({behavior: 'smooth'});
            
        } catch (error) {
            alert('Error: ' + error.message);
            console.error('Error:', error);
        } finally {
            // Reset loading state
            setLoadingState(false);
        }
    });
    
    // History button click
    historyBtn.addEventListener('click', async function() {
        try {
            // Fetch history data
            const response = await fetch('/history');
            if (!response.ok) {
                throw new Error('Error fetching history');
            }
            
            const historyData = await response.json();
            
            // Populate history list
            renderHistoryList(historyData);
            
            // Show modal
            historyModal.style.display = 'block';
            
        } catch (error) {
            alert('Error: ' + error.message);
            console.error('Error:', error);
        }
    });
    
    // Close history modal
    closeHistoryBtn.addEventListener('click', function() {
        historyModal.style.display = 'none';
    });
    
    // Close detail modal
    closeDetailBtn.addEventListener('click', function() {
        detailModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === historyModal) {
            historyModal.style.display = 'none';
        }
        if (e.target === detailModal) {
            detailModal.style.display = 'none';
        }
    });
    
    function setLoadingState(isLoading) {
        if (isLoading) {
            btnText.textContent = 'Generating...';
            btnLoader.style.display = 'block';
            generateBtn.disabled = true;
        } else {
            btnText.textContent = 'Generate Quotes';
            btnLoader.style.display = 'none';
            generateBtn.disabled = false;
        }
    }
    
    function displayResults(data) {
        // Display timestamp
        timestampDisplay.textContent = `Generated on: ${data.timestamp}`;
        
        // Clear previous quotes
        quotesWithoutSearchContainer.innerHTML = '';
        quotesWithSearchContainer.innerHTML = '';
        
        // Display quotes without search
        data.quotes_without_search.forEach(quote => {
            const quoteEl = createQuoteElement(quote);
            quotesWithoutSearchContainer.appendChild(quoteEl);
        });
        
        // Display quotes with search
        data.quotes_with_search.forEach(quote => {
            const quoteEl = createQuoteElement(quote);
            quotesWithSearchContainer.appendChild(quoteEl);
        });
    }
    
    function createQuoteElement(quoteText) {
        const quoteBox = document.createElement('div');
        quoteBox.className = 'quote-box';
        
        const quoteContent = document.createElement('div');
        quoteContent.className = 'quote-content';
        
        const quoteSource = document.createElement('div');
        quoteSource.className = 'quote-source';
        
        // Parse quote and source
        const parts = quoteText.match(/['"](.+?)['"] - (.+)/);
        
        if (parts && parts.length >= 3) {
            const [_, quote, source] = parts;
            quoteContent.textContent = `"${quote}"`;
            quoteSource.textContent = `— ${source}`;
        } else {
            // Fallback if parsing fails
            quoteContent.textContent = quoteText;
            quoteSource.textContent = '';
        }
        
        quoteBox.appendChild(quoteContent);
        quoteBox.appendChild(quoteSource);
        
        return quoteBox;
    }
    
    function renderHistoryList(historyData) {
        historyList.innerHTML = '';
        
        if (historyData.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No history available yet';
            historyList.appendChild(emptyMessage);
            return;
        }
        
        historyData.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.id = entry.id;
            
            const topicEl = document.createElement('div');
            topicEl.className = 'history-topic';
            topicEl.textContent = truncateText(entry.article_topic, 50);
            
            const timestampEl = document.createElement('div');
            timestampEl.className = 'history-timestamp';
            timestampEl.textContent = entry.timestamp;
            
            historyItem.appendChild(topicEl);
            historyItem.appendChild(timestampEl);
            
            // Add click event
            historyItem.addEventListener('click', () => showHistoryDetail(entry.id));
            
            historyList.appendChild(historyItem);
        });
    }
    
    async function showHistoryDetail(id) {
        try {
            // Fetch specific history entry
            const response = await fetch(`/history/${id}`);
            if (!response.ok) {
                throw new Error('Error fetching history detail');
            }
            
            const entry = await response.json();
            
            // Render detail view
            renderDetailView(entry);
            
            // Hide history modal and show detail modal
            historyModal.style.display = 'none';
            detailModal.style.display = 'block';
            
        } catch (error) {
            alert('Error: ' + error.message);
            console.error('Error:', error);
        }
    }
    
    function renderDetailView(entry) {
        detailContent.innerHTML = '';
        
        // Topic and timestamp
        const topicEl = document.createElement('div');
        topicEl.className = 'detail-topic';
        topicEl.textContent = entry.article_topic;
        
        const timestampEl = document.createElement('div');
        timestampEl.className = 'detail-timestamp';
        timestampEl.textContent = `Generated on: ${entry.timestamp}`;
        
        // Standard quotes section
        const standardSection = document.createElement('div');
        standardSection.className = 'detail-quotes-section';
        
        const standardTitle = document.createElement('h4');
        standardTitle.textContent = 'Standard Quotes';
        
        const standardQuotes = document.createElement('div');
        standardQuotes.className = 'detail-quotes';
        
        entry.quotes_without_search.forEach(quote => {
            const quoteEl = createQuoteElement(quote);
            standardQuotes.appendChild(quoteEl);
        });
        
        standardSection.appendChild(standardTitle);
        standardSection.appendChild(standardQuotes);
        
        // Enhanced quotes section
        const enhancedSection = document.createElement('div');
        enhancedSection.className = 'detail-quotes-section';
        
        const enhancedTitle = document.createElement('h4');
        enhancedTitle.textContent = 'Enhanced Quotes (with Tavily Search)';
        
        const enhancedQuotes = document.createElement('div');
        enhancedQuotes.className = 'detail-quotes';
        
        entry.quotes_with_search.forEach(quote => {
            const quoteEl = createQuoteElement(quote);
            enhancedQuotes.appendChild(quoteEl);
        });
        
        enhancedSection.appendChild(enhancedTitle);
        enhancedSection.appendChild(enhancedQuotes);
        
        // Add all elements to detail content
        detailContent.appendChild(topicEl);
        detailContent.appendChild(timestampEl);
        detailContent.appendChild(standardSection);
        detailContent.appendChild(enhancedSection);
    }
    
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    }
});