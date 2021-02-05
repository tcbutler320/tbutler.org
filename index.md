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

<p style="font-family:{{ theme.title-font }};font-weight:100;color:{{ theme.nav-text}};">
I’m a cyber risk consultant, mainframe developer, freelance security researcher, and passionate open-source contributer. At Deloitte, I help modernize legacy IBM mainframe applications. In my own time, I conduct vulnerability research and compete in CTF competitions to better understand the cyber threat landscape.
</p>

