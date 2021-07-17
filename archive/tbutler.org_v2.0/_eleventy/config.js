const filters = require('./filters');
const shortcodes = require('./shortcodes');
const pairedShortcodes = require('./paired-shortcodes');
const markdown = require('./utils');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const caniuse = require('@alexcarpenter/eleventy-plugin-caniuse');

const ENV = require('../src/_data/env.js');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(caniuse);

  // Filters
  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addFilter(filterName, filters[filterName]);
  });

  // Shortcodes
  // Object.keys(shortcodes).forEach((shortCodeName) => {
  //   eleventyConfig.addShortcode(shortCodeName, shortcodes[shortCodeName]);
  // });

  // Paired shortcodes
  Object.keys(pairedShortcodes).forEach((shortCodeName) => {
    eleventyConfig.addPairedShortcode(shortCodeName, pairedShortcodes[shortCodeName]);
  });

  // Plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(syntaxHighlight);

  // Collections
  eleventyConfig.addCollection('posts', (collection) => {
    const published = (p) =>
      ENV.environment === 'production' ? !p.data.draft : true;
    return [
      ...collection.getFilteredByGlob('**/posts/*.md').filter(published),
    ].reverse();
  });


  eleventyConfig.addCollection('caseStudies', (collection) => {
    const published = (p) => !p.data.draft;
    const entries = collection.getFilteredByGlob('**/case-studies/*.md')
      .sort((a, b) => {
        return Number(a.data.order) - Number(b.data.order);
      })
      .filter(published);
    return entries;
  });

  eleventyConfig.addCollection('research', (collection) => {
    const published = (p) => !p.data.draft;
    const entries = collection.getFilteredByGlob('**/research/*.md')
      .sort((a, b) => {
        return Number(a.data.order) - Number(b.data.order);
      })
      .filter(published);
    return entries;
  });


  eleventyConfig.addCollection("all", function (collection) {
    const published = (p) =>
      ENV.environment === 'production' ? !p.data.draft : true;
    return collection.getFilteredByGlob([
      '**/posts/*.md',
      '**/screencasts/*.md',
    ]).filter(published).reverse();
  });

  // Transforms
  eleventyConfig.addTransform('htmlmin', filters.htmlmin);

  // Markdown
  eleventyConfig.setLibrary('md', markdown);

  // ETC.
  eleventyConfig
    .addPassthroughCopy('src/assets')
    .addPassthroughCopy('src/manifest.json')
    .addPassthroughCopy('src/_redirects');

  return {
    templateFormats: ['njk', 'md', 'html'],
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: 'www',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
  }
};
