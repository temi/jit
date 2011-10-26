var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};
var Nav = {
  elem: false,
  load: function(){
    if (!this.elem) 
      this.elem = document.getElementById('navigationPanel');
    this.elem.innerHTML = '<div style="position:relative"><div id="panup" style="position: absolute; left: 13px; top: 4px; width: 18px; height: 18px; cursor: pointer;"><img id="north" src="/Extras/north-mini.png" /></div><div id="panleft" style="position: absolute; left: 4px; top: 22px; width: 18px; height: 18px; cursor: pointer;"><img id="west" src="/Extras/west-mini.png" /></div><div id="panright" style="position: absolute; left: 22px; top: 22px; width: 18px; height: 18px; cursor: pointer;"><img id="east" src="/Extras/east-mini.png" /></div><div id="pandown" style="position: absolute; left: 13px; top: 40px; width: 18px; height: 18px; cursor: pointer;"><img id="south" src="/Extras/south-mini.png" /></div><div id="zoomout" style="position: absolute; left: 13px; top: 99px; width: 18px; height: 18px; cursor: pointer;"><img id="zoomOUT" src="/Extras/zoom-minus-mini.png" /></div><div id="zoomworld" style="position: absolute; left: 13px; top: 81px; width: 18px; height: 18px; cursor: pointer;"><img id="world" style="position: relative; width: 18px; height: 18px;" src="/Extras/zoom-world-mini.png"></div><div id="zoomin" style="position: absolute; left: 13px; top: 63px; width: 18px; height: 18px; cursor: pointer;"><img id="zoomIN" src="/Extras/zoom-plus-mini.png" /></div></div>';
    this.elem.style.left = (800-50) + 'px';
    this.elem.style.position = 'relative';
  }
};

function init(){
    //init data
    var json = Smits.getRoot().json();
    //end
    //init Spacetree
    //Create a new ST instance
    var st = new $jit.Phylo({
        //id of viz container element
        injectInto: 'infovis',
	height:600,
	width:600,
	offsetX:0,
	align:'left',
// 	animate:false,
        //set duration for the animation
        duration: 0,
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 40,
	levelsToShow:Number.MAX_VALUE,
	constrained:false,
        //enable panning
        Navigation: {
          enable:true,
          panning:'avoid nodes',
          zooming: 50
        },
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height: 40,
            width: 60,
            type: 'circle',
	    dim:10,
            color: '#aaa',
            overridable: true,
            align:'left'
        },
	Canvas: {
		background:{
		color: '#fff'
		}
	},
        
        Edge: {
            type: 'line',
            overridable: true,
	    lineWidth: 2
        },
        Events: {
	  enable:true,
	  type:'Native',
	  //Change cursor style when hovering a node  
	  onMouseEnter: function() {  
	    st.canvas.getElement().style.cursor = 'pointer';  
	  },  
	  onMouseLeave: function() {  
	    st.canvas.getElement().style.cursor = '';  
	  },
	  onClick: function( node, eventInfo, e) {
// 	    if(node){
// 	    alert( node.name +' '+ node.id );
// 	    }
	      var leafs;
	      if( node ){
		node.eachSubgraph(function (elem) {
		  if(!elem.exist){
		    elem.exist = true;
		    elem.drawn = true;
		    if( !elem.data.leaf ) {
// 		      st.labels.getLabel(elem.id).innerHTML = '';
// 		      st.labels.getLabel(elem.id).style.display = 'none';
		      elem.data.$alpha = 0.9;
		      elem.data.$type = 'circle';
		    } else {
		      delete elem.data.$alpha;
		      elem.data.$type = 'none';
// 		      elem.drawn = true;
// 		      st.labels.getLabel(elem.id).style.display = 'inline';
		    }
		  }
		  if ( elem.data.leaf ) {
		    leafs ? leafs += "<li>" + elem.name + "</li>": leafs = "<li>" + elem.name + "</li>";
// leafs += "<li>" + elem.name + "</li>"
		  }
		});
		var pos = st.labels.getLabel(node.id);
		var selected = document.getElementById('selected');
		if( !node.data.leaf ) {
// 		  st.labels.getLabel(node.id).innerHTML = '';
// 		  st.labels.getLabel(node.id).style.display = 'none';
		  node.data.$alpha = 0.9;
		  node.data.$type = 'circle';
		  selected.innerHTML = "<ul>" + leafs + "</ul>";
		} else {
		  delete node.data.$alpha ;
		  node.data.$type = 'none';
		  selected.innerHTML = "<ul><li>" + node.name + "</li></ul>";
// 		  st.labels.getLabel(node.id).style.display = 'inline';
		}
		st.clickedNode = node;
		st.computePositions(st.graph.getNode(st.root),'');
		st.plot();
		popup.style.display = '';
		popup.style.top = pos.style.top;
		popup.style.left = pos.style.left;
		popupText.innerHTML = selected.innerHTML;
	  }
  // 	      st.refresh();
// /*	    }*/
	  }
	},
        onBeforeCompute: function(node){
            Log.write("loading " + node.name);
        },
        
        onAfterCompute: function(){
            Log.write("done");
        },
        //request:function(nodeId, level,onComplete){
		//Log.write("sending request for "+node.name);
//	},
        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){
	  label.id = node.id;            
	  label.innerHTML = node.name;
	  label.onclick = function(){
  // 	      node.getPos()
	    var labelPos = $jit.util.getPos(label),
		labelPosx = node.getPos().x, 
		labelPosy = node.getPos().y,
		canvas = st.canvas,
		size = canvas.getSize(),
		canvasPos = canvas.getPos(),
		ctx = canvas.getCtx(),
		ox = canvas.translateOffsetX,
		oy = canvas.translateOffsetY,
		sx = canvas.scaleOffsetX,
		sy = canvas.scaleOffsetY,
		xTranslate = size.width/2 - ox - st.graph.maxXpos,
		yTranslate = size.height/2 - labelPosy - oy;
	    st.canvas.translate( xTranslate , yTranslate );
	    st.controller.Events.onClick(node);
	  };
            //set label styles
            var style = label.style;
            style.width = 60 + 'px';
            style.height = 17 + 'px';            
            style.cursor = 'pointer';
            style.color = '#333';
            style.fontSize = '0.8em';
            style.textAlign= 'center';
            style.paddingTop = '3px';
        },
        
        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function(node){
            //add some color to the nodes in the path between the
            //root node and the selected node.
            if (node.selected) {
//                 node.data.$color = "#ff7";
            }
            else {
                delete node.data.$color;
                //if the node belongs to the last plotted level
                if(!node.anySubnode("exist")) {
                    //count children number
                    var count = 0;
                    node.eachSubnode(function(n) { count++; });
                    //assign a node color based on
                    //how many children it has
                    node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
                }
            }
        },
        
        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function(adj){
	  var flag = false;
	  var parent = adj.nodeFrom;
	  while ( parent ) {
	    if ( st.clickedNode.id == parent.id ) {
	      flag = true;
	      break;
	    }
	    parent = parent.getParents()[0];	    
	  }
// 	  if (adj.nodeFrom.selected && adj.nodeTo.selected) {
	  if( flag ) {
	    adj.data.$color = "#aed";
	    adj.data.$lineWidth = 3;
	  }
	  else {
	    delete adj.data.$color;
	    delete adj.data.$lineWidth;
	  }
        },
        onClick:function ( node  , eventInfo , e){
	  if(node){
	    var elem = document.getElementById('selected');
	    if ( node.leaf ) {
	      elem.innerHTML = node.name;
	    } else {
	      elem.innerHTML = '';
	      node.subGraph(function(n) {
		if ( n.data.leaf ) {
		  elem.innerHTML += n.name + "<br/>";
		}
	      });
	    }
	  }
	},
	onPlaceLabel:function(dom,node){
	  if(node.selected){
	    dom.style.display = 'none';
	  }
	}
    });
    Nav.load();
    //load json data
    st.loadJSON(json);
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree
//     st.geom.translate(new $jit.Complex(-200, 0), "current");
    //emulate a click on the root node.
    st.onClick(st.root);
//     st.graph.getNode(3).drawn = false;
    //end
    //Add event handlers to switch spacetree orientation.
    var top = $jit.id('r-top'), 
        left = $jit.id('r-left'), 
        bottom = $jit.id('r-bottom'), 
        right = $jit.id('r-right'),
        normal = $jit.id('s-normal');
    
    function changeHandler() {
        if(this.checked) {
            top.disabled = bottom.disabled = right.disabled = left.disabled = true;
            st.switchPosition(this.value, "animate", {
                onComplete: function(){
                    top.disabled = bottom.disabled = right.disabled = left.disabled = false;
                }
            });
        }
    };
    
//     top.onchange = left.onchange = bottom.onchange = right.onchange = changeHandler;
    //end
    var north = $jit.id('north'), 
	east = $jit.id('east'), 
	west = $jit.id('west'), 
	south = $jit.id('south');
	
    function clickHandler(){
      var pos = {};
      switch ( this.id ) {
	case 'north': pos = { x:0 , y:10 }; break;
	case 'west': pos = { x: -10 , y:0 }; break;
	case 'east': pos = { x: 10 , y:0 }; break;
	case 'south': pos = { x:0 , y:-10 }; break;
      }
      var canvas = st.canvas;
      canvas.translate( pos.x  , pos.y );
    }
//     north.onclick = south.onclick = east.onclick = west.onclick = clickHandler;
    north.onmousedown = south.onmousedown = east.onmousedown = west.onmousedown = clickHandler;
    var zoomIN = $jit.id('zoomIN'),
	zoomOUT = $jit.id('zoomOUT'),
	world = $jit.id('world');
    function zoomHandler(){
      var scroll;
      switch(this.id){
	case 'zoomIN': scroll= +1; break;
	case 'zoomOUT': scroll = -1; break;
      }
      st.zoom( scroll );
    }
    zoomIN.onclick = zoomOUT.onclick = zoomHandler;
    world.onclick = function (){
      var size = st.canvas.getSize();
      var nodes = st.graph.nodes;
      var height = 0,
	  root = st.graph.getNode(st.clickedNode.id),
	  depth = st.graph.depth;      
/*      var keys = [];
      for(var i in nodes) if (nodes.hasOwnProperty(i)) {
	keys.push(i);
      }*/
//       root.eachSubgraph( function (node){
// 	if ( height < size.height ){
// 	  if ( node.data.leaf ) {
// 	    height += node.getData('height','start') + 8;
// 	  }
// 	  node.exist = true;
// 	} else {
// 	  node.drawn = false;
// 	  node.exist = false;
// 	}
//       });
      for ( var key in depth ) {
	if ( depth[key]) {
	  var nodes =depth[key];
	  for ( var i = 0; i< nodes.length ; i++ ) {
	    var node = nodes[i];
	    if ( height < size.height ) {
	      if ( node.data.leaf ) {
		height += node.getData('height','start') + 8;
	      } else {
		height += node.getData('height','start')/2;
	      }
	      node.drawn = true;
	      node.exist = true;
	    } else {
	      node.drawn = false;
	      node.exist = false;
	    }
	  }
	} 
      }
//       for ( var i = 0; i < keys.length; i++ ){
// 	var node = nodes[keys[i]];
// 	if( node ){
// 	  if ( height < size.height ){
// 	    if ( node.data.leaf ) {
// 	      height += node.getData('height','start') + 8;
// 	    }
// 	  } else {
// 	    node.drawn = false;
// 	    node.exist = false;
// 	  }
// 	}
//       }
      st.computePositions( st.graph.getNode(st.root) , '' );
      st.plot();
    };
    var rightContainer = $jit.id('right-container');
    rightContainer.innerHTML += '<table><tr><td>Search:</td><td><input id="searchString" type="text" size="15" /></td><tr><td></td><td><input type="submit" id="next" value="next"/><input type="submit" id="previous" value="previous"/></td></tr><tr><td>Selected Nodes</td><td><div id="selected"></div></td></tr></table>';
    var next = $jit.id('next'),
	previous = $jit.id('previous');
    var result = [];
    var pos, prevSearch;
    next.onclick = function(){
      search( 1 );
    };
    previous.onclick = function(){
      search( -1 );
    };
    var search = function( step ){
      var searchString  = $jit.id('searchString').value;
      if ( searchString && prevSearch != searchString ) {
	result = [];
	var nodes = st.graph.nodes ;
	prevSearch = searchString;
	for ( var i in nodes ) {
	  var node = nodes[i],
	      name = node.name,
	      pattern = new RegExp(searchString, 'i');
	  if ( name.match( pattern ) ){
	    result.push( node );
	  }
	}
      }
	if ( result.length > 0) {
	  var len  = result.length;
	  pos = nextStep(pos, step ,len);
	  var element = st.labels.getLabel( result[pos].id );
	  element.style.backgroundColor = 'yellow';
	  var shownNode = result[pos];
	  if( !shownNode.exist ) {
	    var parent = shownNode;
// 	    while (!parent.exist) {
// 	      parent.exist = true;
// 	      parent.drawn = true;
// 	      parent = parent.getParents();
// 	      if ( parent.length >= 1 ) {
// 		parent = parent[0];
// 	      }
// 	    }
// 	    st.computePositions( st.graph.getNode( st.clickedNode.id ) , '' );
// 	    st.plot ( );
	    st.refresh();
	  }
	  var prevElem =  st.labels.getLabel( result[nextStep( pos , -1 * step , len )].id);
	  prevElem.style.backgroundColor = 'white';
	  jQuery(element).click();
	}
    };
    function nextStep(pos , step, length){
      // logic so that search starts from the first instance 
      if(typeof pos === 'undefined'){
	return step > 0 ?  0 : length -1;
      }
      var i = ( pos + step ) % length;
      return i<0 ? length + i: i;
    }
    var popup = $jit.id('popup');
    var popupText = $jit.id('popup-text');
}

