---
layout: home
title: Tyler Butler
date: 2020-10-27
---

{% assign theme = site.data.themes[site.ui_theme] %}

<!-- Optional Alert -->
{% if site.alert %}
<div class="alert alert-warning animate__animated animate__bounceInUp animate__delay-2s" role="alert">
    {{ site.alert-message }} 
    {% if site.alert-link %}
    <button class="btn btn-dark btn-sm" href="{{site.alert-link}}">Go</button>
    {% endif %}
</div>
{% endif %}

My name is Tyler Butler, I'm an information security professional with experience in the federal consulting industry. I approach security with a unique blend of technical expertise as an experienced developer and penetration tester with a keen eye on the geo-political forces that shape the industry. Outside of my professional role, I conduct freelance security research and participate in bug bounty and responsible disclosure programs to keep my skills sharp. I am a passionate open-source developer and enjoy competing in CTF competitions to better understand the cyber threat landscape. On this site, you can find my personal vulnerability discoveries, projects, and blog articles. 
