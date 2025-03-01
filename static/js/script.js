document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quoteForm');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const resultsContainer = document.getElementById('resultsContainer');
    const quoteWithoutSearch = document.getElementById('quoteWithoutSearch');
    const quoteWithSearch = document.getElementById('quoteWithSearch');
    
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
            displayQuote(quoteWithoutSearch, data.quote_without_search);
            displayQuote(quoteWithSearch, data.quote_with_search);
            
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
    
    function displayQuote(container, quoteText) {
        // Parse quote and source
        const parts = quoteText.match(/['"](.+?)['"] - (.+)/);
        
        if (parts && parts.length >= 3) {
            const [_, quote, source] = parts;
            container.querySelector('.quote-content').textContent = `"${quote}"`;
            container.querySelector('.quote-source').textContent = `— ${source}`;
        } else {
            // Fallback if parsing fails
            container.querySelector('.quote-content').textContent = quoteText;
            container.querySelector('.quote-source').textContent = '';
        }
    }
});