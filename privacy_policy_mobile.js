    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const today = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = today.toLocaleDateString('en-US', options);
            
            const dateSpan = document.getElementById('current-date');
            if (dateSpan && dateSpan.textContent.includes('[Current Date]')) {
                dateSpan.textContent = formattedDate;
            }
            
            const yearSpanFooter = document.getElementById('current-year-footer');
            if (yearSpanFooter && yearSpanFooter.textContent.includes('[Current Year]')) {
                yearSpanFooter.textContent = today.getFullYear();
            }
        });
    </script>
</body>
</html>