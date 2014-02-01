var SpellingCorrection = (function() {

  var array2D = function(rows,cols) {
    var array = new Array(rows);
    for(var i = rows; i--;)
      array[i] = new Array(cols);

    return array;
  };
  var primitiveMin = function(a, b){
    if(a > b)
      return b;
    else
      return a;
  };
  return {
    //Damerau–Levenshtein distance
    DLDistance: function(source, target) {
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
      for(i = 0; i <= tgt_len; i++) {
        table[1][i + 1] = i;
        table[0][i + 1] = INF;
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
                            , table[i][j + 1]));
          table[i + 1][j + 1] = primitiveMin(
              table[i + 1][j + 1]
            , table[i1][j1] + i - i1 - 1 + j - j1 - 1);
          sorted_dict[source.charAt(i - 1)] = i;
        }
        return table[src_len + 1][tgt_len + 1]; 
      }
    }
  };
}());
