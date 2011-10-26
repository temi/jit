/*
 * Class: Layouts.PhyloJiVE
 * 
 * Implements a Tree Layout.
 * 
 * Implemented By:
 * 
 * <PhyloJiVE>
 * 
 * 
 */
Layouts.PhyloJiVE = (function() {
  //Layout functions
  var slice = Array.prototype.slice;

  /*
     Calculates the max width and height nodes for a tree level
  */  
  function getBoundaries(graph, config, level, orn, prop) {
    var dim = config.Node;
    var multitree = config.multitree;
    if (dim.overridable) {
      var w = -1, h = -1;
      graph.eachNode(function(n) {
        if (n._depth == level
            && (!multitree || ('$orn' in n.data) && n.data.$orn == orn)) {
          var dw = n.getData('width', prop);
          var dh = n.getData('height', prop);
          w = (w < dw) ? dw : w;
          h = (h < dh) ? dh : h;
        }
      });
      return {
        'width' : w < 0 ? dim.width : w,
        'height' : h < 0 ? dim.height : h
      };
    } else {
      return dim;
    }
  }


  function movetree(node, prop, val, orn) {
    var p = (orn == "left" || orn == "right") ? "y" : "x";
    node.getPos(prop)[p] += val;
  }


  function moveextent(extent, val) {
    var ans = [];
    $.each(extent, function(elem) {
      elem = slice.call(elem);
      elem[0] += val;
      elem[1] += val;
      ans.push(elem);
    });
    return ans;
  }


  function merge(ps, qs) {
    if (ps.length == 0)
      return qs;
    if (qs.length == 0)
      return ps;
    var p = ps.shift(), q = qs.shift();
    return [ [ p[0], q[1] ] ].concat(merge(ps, qs));
  }


  function mergelist(ls, def) {
    def = def || [];
    if (ls.length == 0)
      return def;
    var ps = ls.pop();
    return mergelist(ls, merge(ps, def));
  }


  function fit(ext1, ext2, subtreeOffset, siblingOffset, i) {
    if (ext1.length <= i || ext2.length <= i)
      return 0;

    var p = ext1[i][1], q = ext2[i][0];
    return Math.max(fit(ext1, ext2, subtreeOffset, siblingOffset, ++i)
        + subtreeOffset, p - q + siblingOffset);
  }


  function fitlistl(es, subtreeOffset, siblingOffset) {
    function $fitlistl(acc, es, i) {
      if (es.length <= i)
        return [];
      var e = es[i], ans = fit(acc, e, subtreeOffset, siblingOffset, 0);
      return [ ans ].concat($fitlistl(merge(acc, moveextent(e, ans)), es, ++i));
    }
    ;
    return $fitlistl( [], es, 0);
  }


  function fitlistr(es, subtreeOffset, siblingOffset) {
    function $fitlistr(acc, es, i) {
      if (es.length <= i)
        return [];
      var e = es[i], ans = -fit(e, acc, subtreeOffset, siblingOffset, 0);
      return [ ans ].concat($fitlistr(merge(moveextent(e, ans), acc), es, ++i));
    }
    ;
    es = slice.call(es);
    var ans = $fitlistr( [], es.reverse(), 0);
    return ans.reverse();
  }


  function fitlist(es, subtreeOffset, siblingOffset, align) {
    var esl = fitlistl(es, subtreeOffset, siblingOffset), esr = fitlistr(es,
        subtreeOffset, siblingOffset);

    if (align == "left")
      esr = esl;
    else if (align == "right")
      esl = esr;

    for ( var i = 0, ans = []; i < esl.length; i++) {
      ans[i] = (esl[i] + esr[i]) / 2;
    }
    return ans;
  }


  function design(graph, node, prop, config, orn) {
    var multitree = config.multitree;
    var auxp = [ 'x', 'y' ], auxs = [ 'width', 'height' ];
    var ind = +(orn == "left" || orn == "right");
    var p = auxp[ind], notp = auxp[1 - ind];

    var cnode = config.Node;
    var s = auxs[ind], nots = auxs[1 - ind];

    var siblingOffset = config.siblingOffset;
    var subtreeOffset = config.subtreeOffset;
    var align = config.align;
    var baseZero = function (pos){ 
	var min = Math.abs(Math.min.apply(this,pos)); 
	for(var i = 0;i<pos.length;i++){
	   pos[i]+=min;
	}
	return pos;
    };
//     var factor = 1;
    if ( !graph.maxLen && !graph.minLen && !graph.factor){
	var max = Number.MIN_VALUE , min=Number.MAX_VALUE;
	graph.eachNode( function ( node ) {
		if ( node.data.len < min ){
			min = node.data.len;
		}
		if ( node.data.len > max ){
			max = node.data.len;
		}
	});
	graph.minLen = min;
	graph.maxLen = max;
	graph.factor = ( 10 ) / ( graph.maxLen - graph.minLen );
    }
    function $design(node, maxsize, y, xpos) {
	var ymin = Number.MAX_VALUE , ymax= Number.MIN_VALUE ;
	var subnodeVisible = false;
// 	factor = ( 100 ) / ( graph.maxLen - graph.minLen );
	xpos += ( graph.factor * node.data.len );
	node.eachSubnode(function(n){
	  if(n.exist){
	    subnodeVisible = true;
	    y = $design ( n , null , y, xpos);
	    if ( ymin > y.ymid ) {
	      ymin = y.ymid;
	    }
	    if ( ymax < y.ymid ) {
	      ymax = y.ymid;
	    }
// 	    ypos = $design ( n , null , ypos , xpos);
// 	    if ( ymin > ypos ) {
// 	      ymin = ypos;
// 	    }
// 	    if ( ymax < ypos ) {
// 	      ymax = ypos;
// 	    }
	  }
	});
/* 	if( !node.anySubnode () ) {
	  ypos = node.getPos( prop )['y'] = ( ypos + node.getData( s , prop ) + siblingOffset );
	} else  */
	if ( !graph.maxXpos ) {
	  graph.maxXpos = 0;
	}
	if ( graph.maxXpos < xpos ) {
	  graph.maxXpos = xpos;
	}
	if (subnodeVisible){
	  y.ymid = node.getPos( prop )['y'] = ( ymax + ymin ) / 2;
	} else {
// 	  ypos = node.getPos( prop )['y'] = ( ypos + node.getData( s , prop ) + siblingOffset );
// 	  y.ymid = y.ymin = y.ymax = node.getPos( prop )['y'] = ( y.ymax + node.getData( s , prop ) + siblingOffset );
	  y.ymid = y.ymin = y.ymax = node.getPos( prop )['y'] = ( y.ymax + node.getData( s , prop ) + siblingOffset );
	}
// 	node.getPos( prop )['x'] = xpos;
	node.getPos( prop )['x'] = xpos;
	return y;
    }
    
    $design(node, false, { ymid : 0 , ymin : 0 , ymax : 0 },0);
  }


  return new Class({
    /*
    Method: compute
    
    Computes nodes' positions.

     */
    compute : function(property, computeLevels) {
      var prop = property || 'start';
      var node = this.graph.getNode(this.root);
      $.extend(node, {
        'drawn' : true,
        'exist' : true,
        'selected' : true
      });
      NodeDim.compute(this.graph, prop, this.config);
      if (!!computeLevels || !("_depth" in node)) {
        this.graph.computeLevels(this.root, 0, "ignore");
      }
      
      this.computePositions(node, prop);
    },

    computePositions : function(node, prop) {
      var config = this.config;
      var multitree = config.multitree;
      var align = config.align;
      var indent = align !== 'center' && config.indent;
      var orn = config.orientation;
      var orns = multitree ? [ 'top', 'right', 'bottom', 'left' ] : [ orn ];
      var that = this;
      $.each(orns, function(orn) {
        //calculate layout
          design(that.graph, node, prop, that.config, orn, prop);
          var i = [ 'x', 'y' ][+(orn == "left" || orn == "right")];
	  var prev;
	  if(!prev){
		prev = node;  
	  }
          //absolutize
//           (function red(node) {
//             node.eachSubnode(function(n) {
// // 	  node.eachSubgraph(function(n) {
//               if (n.exist
//                   && (!multitree || ('$orn' in n.data) && n.data.$orn == orn)) {
// 
// //                 n.getPos(prop)[i] += node.getPos(prop)[i];
//                 n.getPos(prop)[i] += prev.getPos(prop)[i];
// 		prev = n;
//                 if (indent) {
//                   n.getPos(prop)[i] += align == 'left' ? indent : -indent;
//                 }
//                  red(n);
//               }
//             });
//           })(node);
        });
    }
  });
  
})();