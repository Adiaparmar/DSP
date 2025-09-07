document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.copy-btn');
    const statusMessage = document.getElementById('status-message');

    // Create a pre-loaded cache for file contents
    const fileContents = {};

    // Pre-load all text files
    const preloadFiles = async () => {
        const fileNames = Array.from(buttons).map(btn => btn.getAttribute('data-file'));
        
        for (const fileName of fileNames) {
            try {
                const response = await fetch(fileName);
                if (response.ok) {
                    fileContents[fileName] = await response.text();
                    console.log(`Pre-loaded: ${fileName}`);
                }
            } catch (error) {
                console.error(`Failed to pre-load ${fileName}:`, error);
            }
        }
    };

    // Start pre-loading
    preloadFiles();

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const fileName = button.getAttribute('data-file');
            try {
                let textContent;
                
                // Check if content is already in cache
                if (fileContents[fileName]) {
                    textContent = fileContents[fileName];
                } else {
                    // Fetch the content if not cached
                    const response = await fetch(fileName);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${fileName}`);
                    }
                    
                    textContent = await response.text();
                    fileContents[fileName] = textContent; // Cache for future use
                }
                
                // Copy to clipboard
                await navigator.clipboard.writeText(textContent);
                
                // Show success message
                showStatusMessage(`Content of "${fileName}" copied to clipboard!`, 'success');
            } catch (error) {
                console.error('Error:', error);
                showStatusMessage(`Error: ${error.message}`, 'error');
            }
        });
    });

    function showStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `show ${type}`;
        
        // Hide the message after 3 seconds
        setTimeout(() => {
            statusMessage.className = '';
        }, 3000);
    }
});