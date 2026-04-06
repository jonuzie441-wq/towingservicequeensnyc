const fs = require('fs');
const posts = JSON.parse(fs.readFileSync('scripts/gbp-posts.json', 'utf-8'));

const jsLines = posts.map(function(p) {
  var escaped = p.text;
  escaped = escaped.split('\\').join('\\\\');
  escaped = escaped.split('"').join('\\"');
  return '  "' + escaped + '"';
});

var newArray = 'var GBP_POSTS = [\n' + jsLines.join(',\n') + '\n];';

var html = fs.readFileSync('admin.html', 'utf-8');
html = html.replace(/var GBP_POSTS = \[[\s\S]*?\];/, newArray);
fs.writeFileSync('admin.html', html);
console.log('Updated admin.html with ' + posts.length + ' south Queens posts');
