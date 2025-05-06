---
title: "Test"
slug: "test"
date: "2025-04-20"
shortDescription: "This is just the begining of my note. Stay tune!"
---

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
  /* CSS-only spoiler using checkbox hack */
  .spoiler-toggle {
    display: none;
  }

  .spoiler-label {
    cursor: pointer;
    display: inline-block;
    padding: 0.5rem 1rem;
    color: #0d6efd;
    border: 1px solid #0d6efd;
    border-radius: 0.25rem;
    transition: background-color 0.3s, color 0.3s;
  }

  .spoiler-label:hover {
    background-color: #0d6efd;
    color: white;
  }

  .spoiler-content {
    display: none;
    margin-top: 1rem;
  }

  .spoiler-toggle:checked + .spoiler-label + .spoiler-content {
    display: block;
  }
</style>


<div class="d-flex justify-content-center align-items-center" style="height: 30vh;">
  <h1 class="display-4 text-primary text-center">🚧 Just a test note, nothing too interesting... yet..</h1>
</div>

<div class="container">
  <div class="alert alert-info text-center" role="alert">
    <h4 class="alert-heading">Click below for a surprise.</h4>
    <input type="checkbox" id="spoiler-toggle" class="spoiler-toggle">
    <label for="spoiler-toggle" class="spoiler-label">Show Surprise</label>
    <div class="spoiler-content">
      <div class="card card-body mt-3">
        <img src="https://media.giphy.com/media/oUDtWSI1gJQJs8zGPG/giphy.gif" class="img-fluid" alt="Dancing Cat GIF">
        <p class="mt-2"><a href="https://giphy.com/gifs/dancing-cat-mr-fluffy-and-felicity-oUDtWSI1gJQJs8zGPG" target="_blank">via GIPHY</a></p>
      </div>
    </div>
  </div>
</div>
