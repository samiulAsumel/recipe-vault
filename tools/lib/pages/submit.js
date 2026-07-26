'use strict';

const { esc, attr } = require('../html');
const shell = require('../shell');

const DEPTH = 0;

function categoryOptions(site) {
  return Object.entries(site.categories)
    .map(([key, cat]) => `<option value=${attr(key)}>${esc(cat.label)}</option>`)
    .join('\n              ');
}

function dietChecklist(site) {
  return Object.entries(site.dietary)
    .map(([key, label]) => `<div class="checkbox-row">
              <input type="checkbox" id=${attr('tag-' + key)} name="dietaryTags" value=${attr(key)} />
              <label for=${attr('tag-' + key)}>${esc(label)}</label>
            </div>`)
    .join('\n            ');
}

function renderSubmit(site) {
  const html = shell.head(site, {
    depth: DEPTH,
    path: 'submit-recipe.html',
    title: `Submit a Recipe -- ${site.siteName}`,
    description: 'Share your own recipe with the Homestyle Recipe Book community.',
    robots: 'noindex, follow',
  }) + `
  <!-- Generated from data/site.json by tools/build.js -- hand edits here are overwritten on the next build. -->
  ${shell.header(site, { depth: DEPTH, currentHref: 'submit-recipe.html' })}
  <main id="main-content">
    <section class="category-page">
      <h1>Share Your Recipe</h1>
      <p>Fill in the details below. Fields marked as required must be completed before the form can be submitted.</p>

      <form class="recipe-form" action="#" method="post" enctype="multipart/form-data">
        <fieldset>
          <legend>Recipe Details</legend>

          <div class="form-field">
            <label for="recipe-name">Recipe Name</label>
            <input type="text" id="recipe-name" name="recipeName" required minlength="3" maxlength="80" autocomplete="off" />
          </div>

          <div class="form-field">
            <label for="category">Category</label>
            <select id="category" name="category" required>
              <option value="">-- Choose a category --</option>
              ${categoryOptions(site)}
            </select>
          </div>

          <div class="form-field">
            <label for="prep-time">Prep Time (minutes)</label>
            <input type="number" id="prep-time" name="prepTimeMinutes" min="1" max="300" step="1" required />
          </div>

          <div class="form-field">
            <label for="servings">Servings</label>
            <input type="number" id="servings" name="servings" min="1" max="20" step="1" required />
          </div>

          <fieldset>
            <legend>Difficulty</legend>
            <div class="radio-row">
              <input type="radio" id="difficulty-easy" name="difficulty" value="easy" checked />
              <label for="difficulty-easy">Easy</label>
            </div>
            <div class="radio-row">
              <input type="radio" id="difficulty-medium" name="difficulty" value="medium" />
              <label for="difficulty-medium">Medium</label>
            </div>
            <div class="radio-row">
              <input type="radio" id="difficulty-hard" name="difficulty" value="hard" />
              <label for="difficulty-hard">Hard</label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Dietary Tags (check all that apply)</legend>
            ${dietChecklist(site)}
          </fieldset>
        </fieldset>

        <fieldset>
          <legend>Ingredients &amp; Steps</legend>

          <div class="form-field">
            <label for="ingredients">Ingredients (one per line)</label>
            <textarea id="ingredients" name="ingredients" required minlength="10" rows="6"></textarea>
          </div>

          <div class="form-field">
            <label for="instructions">Instructions</label>
            <textarea id="instructions" name="instructions" required minlength="20" rows="8"></textarea>
          </div>
        </fieldset>

        <fieldset>
          <legend>Photo</legend>
          <div class="form-field">
            <label for="photo">Upload a Photo (optional)</label>
            <input type="file" id="photo" name="photo" accept="image/png, image/jpeg" />
          </div>
        </fieldset>

        <fieldset>
          <legend>Your Info</legend>

          <div class="form-field">
            <label for="submitter-name">Your Name</label>
            <input type="text" id="submitter-name" name="submitterName" required autocomplete="name" />
          </div>

          <div class="form-field">
            <label for="submitter-email">Your Email</label>
            <input type="email" id="submitter-email" name="submitterEmail" required autocomplete="email" />
          </div>
        </fieldset>

        <div class="checkbox-row">
          <input type="checkbox" id="agree" name="agreeToGuidelines" value="yes" required />
          <label for="agree">I agree that this recipe is my own and can be shared publicly.</label>
        </div>

        <div class="form-actions">
          <button type="submit" class="button">Submit Recipe</button>
          <button type="reset">Clear Form</button>
        </div>
      </form>
    </section>
  </main>
  ` + shell.footer(site, { depth: DEPTH });

  return html;
}

module.exports = { renderSubmit, DEPTH };
