---
title: articles
permalink: /articles/
layout: page
---

{% for tag in site.tags %} {% capture name %}{{ tag | first }}{% endcapture %}

<h1 class="post-header" id="{{ name | downcase | slugify }}">
  On {{ name }}
</h1>

{% for post in site.tags[name] %}
<article class="posts">
  <header class="posts-header">
    <h4 class="posts-title">
      <a href="{{ post.url }}">{{ post.title | escape }}</a>
    </h4>
  </header>
  <span class="posts-description">{{ post.description }}</span>

</article>
{% endfor %} {% endfor %}
