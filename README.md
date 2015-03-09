# angular.markdown



## Getting Started

In your web page:

```html
<!-- font-awesome -->
<link rel="stylesheet" type="text/css" href="font-awesome.css">
<!-- highlight code style -->
<link rel="stylesheet" type="text/css" href="dark.css">
<!-- the editor style -->
<link rel="stylesheet" type="text/css" href="style.min.css">

<script src="angular.js"></script>
<script src="angular-sanitize.js"></script>
<script src="highlight.pack.js"></script>
<script src="marked.js"></script>
<script src="dist/angular.markdown.min.js"></script>
```

## Examples
```html
<form name="test">
    <div md-editor md-editor-model="content" md-editor-minlength="2" md-editor-maxlength="1000" md-editor-formname="test" md-editor-submit='reply()'></div>
</form>
<script type="text/javascript">
    angular.module('demo', ['angular.markdown'])
    	.controller('demoCtrl', ['$scope', function ($scope) {
    		$scope.reply = function(){
    			alert($scope.content);
    		}
    	}]);
</script>
```

