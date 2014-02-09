var SpellingCorrection = (function() {
  var containsTerm = function(array, term) {
    var length = array.length;
    if(length === 0) return false;
    for(;length--;) {
      if(array[length].term === term)
        return true;
    }
    return false;
  };
  var array2D = function(rows,cols) {
    var array = [];
    for( var i = rows; i--;) {
      array[i] = [];
      for( var j = cols; j--;)
        array[i][j] = [];
    }
    return array;
  };
  var primitiveMin = function(a, b){
    if(a > b)
      return b;
    else
      return a;
  };
  //core algo parts
  //Damerau–Levenshtein distance
  var dlDistance = function(source, target) {
    var src_len = source.length;
    var tgt_len = target.length;
    var table   = array2D(src_len + 2, tgt_len + 2);
    var INF     = src_len + tgt_len;
    table[0][0] = INF;
    var i, j, i1, j1;
    for(i = 0; i <= src_len; i++) {
      table[i + 1][1] = i;
      table[i + 1][0] = INF;
    }
    for(j = 0; j <= tgt_len; j++) {
      table[1][j + 1] = j;
      table[0][j + 1] = INF;
    }
    var sorted_dict = {}; //http://bit.ly/1dZJtzS
    var cat_chars = source + target;
    for(i = cat_chars.length; i--;) {
      var cur_char = cat_chars.charAt(i);
      if(!sorted_dict.hasOwnProperty(cur_char))
        sorted_dict[cur_char] = 0;
    }
    for(i = 1; i <= src_len; i++) {
      var db = 0;
      for(j = 1; j <= tgt_len; j++) {
        i1 = sorted_dict[target.charAt(j - 1)];
        j1 = db;
        if(source.charAt(i-1) === target.charAt(j - 1)){
          table[i + 1][j + 1] = table[i][j];
          db = j;
        } else 
          table[i + 1][j + 1] = primitiveMin(
              table[i][j]
            , primitiveMin( table[i + 1][j]
                          , table[i][j + 1])) + 1;
        table[i + 1][j + 1] = primitiveMin(
            table[i + 1][j + 1]
          , table[i1][j1] + i - i1 - 1 + j - j1 - 1);
      }
      sorted_dict[source.charAt(i - 1)] = i;
    }
    return table[src_len + 1][tgt_len + 1];
  }

  var distance = function(editDict, editInput, inputOrig) {
    if(editDict.term === inputOrig)
      return 0;
    else if(editDict.dist === 0)
      return editInput.dist;
    else if(editInput.dist === 0)
      return editDict.dist;
    else
      return dlDistance(editDict.term, inputOrig);
  }

  var lookup = function(input, lang, editDistMax) {
    var candidates = [],
        suggestions = [];
    candidates.push({
      term: input,
      dist: 0
    });
    //try to refactor: break,continue ugly af
    while(candidates.length > 0) {
      var candidate = candidates.splice(0,1)[0];
      if((candidate.dist > editDistMax) || 
        ((verbose < 2) &&
          (suggestions.length > 0) &&
          (candidate.dist > suggestions[0].dist))) break;
      var val = dictionary[lang + candidate.term];
      if(typeof val !== 'undefined') {
        var suggestion = {
          term: val.term,
          count: val.count,
          dist: candidate.dist
        };
        if(containsTerm(suggestions, val.term)) {
          suggestions.push(suggestion);
          if((verbose < 2) && (candidate.dist === 0)) break;
        }
      }

      var dist, val1;
      for(var i = 0, var length = val.suggestions.length; i < length; i++) {
        if(!containsTerm(suggestions, suggestion.term)) {
          dist = distance(suggestion, candidate, input);
          if((verbose < 2) && (suggestions.length > 0)) {
            if(suggestions[0].dist > dist) suggestions = [];
            if(suggestions[0].dist < dist) continue;
            if(dist <= editDistMax && (val1 = dictionary) !== 'undefined')
              suggestions.push({
                term: val1.term,
                count: val1.count,
                dist: dist
              });
          }
        }
      }
      if(candidate.dist < editDistMax) {
        var edits = edits(candidate.term, candidate.dist, false); //next
        for(i = edits.length; i--;) {
          if(!containsTerm(candidates, edits[i].term))
            candidates.push(edits[i]);
        }
      }
    }

    suggestions.sort(function(a, b) {
      var dDist = a.dist - b.dist;
      if(dDist === 0)
        return -(a.count - b.count);
      else
        return dDist;
    });

    if((verbose === 0) && (suggestions.length > 1))
      return suggestions.slice(0,1);
    else
      return suggestions;
  }

  return {
    correct: function(word) {
      //return array of possible corrections
    }
  };
}());
