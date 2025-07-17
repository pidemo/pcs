# Leaderboard.js Documentation

## Overview

The `leaderboard.js` script automatically generates leaderboards for both **games** and **leagues** based on JSON data coming from the CMS lists. It detects the data type automatically and renders the appropriate leaderboard structure.

## Required HTML Attributes

### Leaderboard Container

The main leaderboard container must have the following attribute:

data-leaderboard="wrapper"

### JSON Data Element

An element containing the JSON data must be present inside the wrapper:

The element with a class of .leaderboard_json should have its text set to the Leaderboard JSON CMS field.

### Template Element (Optional)

The template element should have this attribute (it will be automatically removed):

data-leaderboard="template"

## Data Structures

### League Leaderboard

For league leaderboards, only 3 columns are needed:

- The Name of the Player (coming from the JSON)
- The PCS of the Player (coming from the JSON)
- The Rank of the Player (computed based on the PCS)

And this is what the JSON will be:

```json
[
  { "playerName": "Jace", "playerPcst": "222" },
  { "playerName": "D Samp", "playerPcst": "285" }
]
```

### Game Leaderboard

For game leaderboards, 5 columns are needed:

- The Name of the Player (coming from the JSON)
- The UT of the Player (coming from the JSON)
- The OPP of the Player (computed based on the PCS)
- The PCS of the Player (coming from the JSON)
- The Rank of the Player (computed based on the PCS)

And this is what the JSON structure will be:

```json
[
  {
    "playerAtid": "recEsYoc1wEjfindv",
    "accountAtid": "reckkN9TcwyRVzjmT",
    "playerName": "Seasmoke",
    "ph": "69",
    "pa": "39",
    "pcs": "216"
  },
  {
    "playerAtid": "recqqJbdFb4whEpdf",
    "accountAtid": "recPGeu13awqKThQK",
    "playerName": "Sissy",
    "ph": "62",
    "pa": "32",
    "pcs": "209"
  }
]
```

## Generated HTML Structure

### League Leaderboard Items

```html
<div class="leaderboard_item is-league">
  <div class="leaderboard_cell text-align-left">[Player Name]</div>
  <div class="leaderboard_cell">[Player Score]</div>
  <div class="leaderboard_cell">[Rank]</div>
</div>
```

### Game Leaderboard Items

```html
<div class="leaderboard_item">
  <div class="leaderboard_cell text-align-left">[Player Name]</div>
  <div class="leaderboard_cell">[PH Score]</div>
  <div class="leaderboard_cell">[PA Score]</div>
  <div class="leaderboard_cell">[PCS Score]</div>
  <div class="leaderboard_cell">[Rank]</div>
</div>
```

## Complete HTML Example

### League Leaderboard

```html
<div data-leaderboard="wrapper" class="is-hidden-onload">
  <script type="application/json" data-leaderboard="json">
    [
      { "playerName": "Jace", "playerPcst": "222" },
      { "playerName": "D Samp", "playerPcst": "285" },
      { "playerName": "Alex", "playerPcst": "198" }
    ]
  </script>
</div>
```

### Game Leaderboard

```html
<div data-leaderboard="wrapper" class="is-hidden-onload">
  <script type="application/json" data-leaderboard="json">
    [
      {
        "playerAtid": "recEsYoc1wEjfindv",
        "accountAtid": "reckkN9TcwyRVzjmT",
        "playerName": "Seasmoke",
        "ph": "69",
        "pa": "39",
        "pcs": "216"
      },
      {
        "playerAtid": "recqqJbdFb4whEpdf",
        "accountAtid": "recPGeu13awqKThQK",
        "playerName": "Sissy",
        "ph": "62",
        "pa": "32",
        "pcs": "209"
      }
    ]
  </script>
</div>
```

## How It Works

1. **Auto-Detection**: The script automatically detects whether the data represents a game or league by checking for the presence of `ph` and `pa` fields
2. **Sorting**:
   - League leaderboards are sorted by `playerPcst` (ascending)
   - Game leaderboards are sorted by `pcs` (ascending)
3. **Rendering**: Items are dynamically generated and appended to the leaderboard container
4. **Visibility**: The `is-hidden-onload` class is removed once the leaderboard is successfully rendered

## CSS Classes

- `.leaderboard_item`: Applied to all leaderboard items
- `.is-league`: Additional class applied only to league leaderboard items
- `.leaderboard_cell`: Applied to individual cells within each item
- `.text-align-left`: Applied to the first cell (player name) for left alignment
- `.is-hidden-onload`: Used to hide the leaderboard until data is loaded

## Notes

- Values like "NA" are supported and will be displayed as-is
- The script handles empty or malformed JSON gracefully
- Ranking starts from 1 and increments sequentially
- The template element (if present) is automatically removed before rendering
