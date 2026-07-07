const fs = require("fs");
const html = fs.readFileSync(
  "C:/Users/mjawa/OneDrive - Athabasca University/Dev Projects/Deen o Dunya/deen-o-dunya/dist/index.html",
  "utf8"
);

// Find all </script> positions
var allCloses = [];
var pos = 0;
while (true) {
  var idx = html.indexOf("</script>", pos);
  if (idx === -1) break;
  allCloses.push(idx);
  pos = idx + 9;
}

// Main script starts at position 36772 (first inline <script> without src=)
var mainStart = 36772 + 8;
var mainEnd = allCloses[0];
var js = html.substring(mainStart, mainEnd);

console.log("Main script: chars", mainStart, "to", mainEnd, "=", js.length, "bytes");

// Find brace errors
var depth = 0;
var inString = false;
var stringChar = "";
var inLineComment = false;
var inBlockComment = false;

for (var i = 0; i < js.length; i++) {
  var ch = js[i];

  if (inLineComment) {
    if (ch === "\n") inLineComment = false;
    continue;
  }
  if (inBlockComment) {
    if (ch === "*" && js[i + 1] === "/") { inBlockComment = false; i++; }
    continue;
  }
  if (inString) {
    if (ch === "\\") { i++; continue; }
    if (ch === stringChar) inString = false;
    continue;
  }

  if (ch === "'" || ch === '"' || ch === "`") { inString = true; stringChar = ch; continue; }
  if (ch === "/" && js[i + 1] === "/") { inLineComment = true; i++; continue; }
  if (ch === "/" && js[i + 1] === "*") { inBlockComment = true; i++; continue; }

  if (ch === "{" || ch === "(" || ch === "[") depth++;
  if (ch === "}" || ch === ")" || ch === "]") {
    depth--;
    if (depth < 0) {
      var ctx = js.substring(Math.max(0, i - 100), Math.min(js.length, i + 30));
      console.log("EXTRA CLOSING at pos", i, "depth:", depth);
      console.log("Context:", JSON.stringify(ctx));
      process.exit(1);
    }
  }
}

console.log("Final depth:", depth);
if (depth !== 0) {
  // Find likely error location - walk back from end
  var d2 = 0;
  for (var i2 = js.length - 1; i2 >= 0; i2--) {
    // Simple reverse scan to find where imbalance starts
    var ch2 = js[i2];
    if (ch2 === "}" || ch2 === ")" || ch2 === "]") d2++;
    if (ch2 === "{" || ch2 === "(" || ch2 === "[") {
      d2--;
      if (d2 < 0) {
        console.log("Likely missing close near pos", i2);
        console.log("Context:", JSON.stringify(js.substring(Math.max(0,i2-80), Math.min(js.length,i2+80))));
        break;
      }
    }
  }
}
