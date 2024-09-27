---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

***
### **<span style="color:blue"> Note: </span>** The unpublished research listed here is subject to change and/or may contain errors, and thus should not be cited.
***
***

<ul id="itemList">
    <li class="item">Research on AI</li>
    <li class="item">Machine Learning Techniques</li>
    <li class="item">Understanding Neural Networks</li>
    <li class="item">Data Science Applications</li>
</ul>

<style>
    .hidden { display: none; }
</style>

<script>
    const filterButton = document.getElementById('filterButton');
    const items = document.querySelectorAll('.item');

    filterButton.addEventListener('click', () => {
        items.forEach(item => {
            if (item.textContent.includes('AI')) {  // Adjust filter criteria as needed
                item.classList.toggle('hidden');
            }
        });
    });
</script>
