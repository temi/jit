Smits = {};
Smits.Common = {
	nodeIdIncrement : 0,
	activeNode: 0,
	
	/* Rounds float to a defined number of decimal places */
	roundFloat : function (num, digits) {
		var i = 0, 
			dec = 1;
		while (i < digits) {
			dec *= 10;
			i++;
		}
		return Math.round(num * dec) / dec; 
	}
};
Smits.Node = function () {
	/**
	* Node Class
	* Allows objects to be traversed across children
	*
	*/
	return function (o, parentInstance) {
		// initiate object
		this.id = Smits.Common.nodeIdIncrement += 1;
		this.level = 0;
		this.len = 0;
		this.newickLen = 0;
		this.name = '';
		this.type = '';
		this.chart = {};
		this.img = [];
		
		if(o) Smits.Common.apply(this, o);

		/* Cache Calculations */
		this._countAllChildren = false;
		this._countImmediateChildren = false;
		this._midBranchPosition = false;
		
		this.children = new Array();
		
		if(parentInstance){
			parentInstance.children.push(this); 
		}
		//this code is for trees
				this.json = function(){
			var childJSON = [];
			var leaves = 0;
			for( var i= 0;i<this.children.length;i++){
			  var j = this.children[i].json();
			  childJSON.push(j);
			  leaves += j.data.leaf;
			  leaves += j.data.leaves;
			}
			var that = this;
			// TODO: hard coding. remove this after demo
 			if(childJSON.length !== 0) {
				return {"id":this.id,"name":'',"data":{'leaves':leaves,'leaf':0,'len': this.len,'$type':'circle', '$dim':5, '$color':'#fff'},"children":childJSON};				
 			}
			else{
			  this.name = this.name.replace(/_/g,' ');
				var nodeJSON = {"id":this.id,"name":this.name,"data":{'leaves':0,'leaf':1,'len': this.len,'$dim': 5,'$height':20,'$type':'none'},"children":childJSON};
				if ( nodeJSON.id == 23 ){
				  nodeJSON.data.href = 'http://www.worldwidewattle.com/speciesgallery/tumida.php'; 
				}
				if ( nodeJSON.id == 48 ) {
				  nodeJSON.data.href =  'http://en.wikipedia.org/wiki/Acacia_visco';
				}
				return nodeJSON;
			}
			  
		};
//this code is for graphs
// 		graphNodes = [];
// 		this.json = function(){
// 			var childJSON = [];
// 			for( var i= 0;i<this.children.length;i++){
// 				childJSON.push({"nodeTo":this.children[i].id.toString()});
// 				this.children[i].json();
// 			}
// 			var that = this;
//  			graphNodes.push({"id":this.id.toString(),"name":this.name,"adjacencies":childJSON});
// 			return graphNodes;
// 		};
	}
}();

Smits.NewickParse = function(){

	var text,
	ch,
	pos,
	mLevel = 0,
	mNewickLen = 0,
	root,
	validate,
		
	object = function (parentNode) {
		var node  = new Smits.Node();
		
		while (ch !== ')' && ch !== ',') {
			if (ch === ':'){
				next();
				node.len = Smits.Common.roundFloat(string(), 4);			// round to 4 decimal places
				if(node.len == 0){
					node.len = 0.0001;
				}
			} else if (ch === "'" || ch === '"'){ 
				node.type = "label";
				node.name = quotedString(ch);
			} else {
				node.type = "label";
				node.name = string();
			}
		}
		node.level = parentNode.level + 1;
		return node;
	},
	
	objectIterate = function(parentNode){
		var node = new Smits.Node();
		if(parentNode){
			node.level = parentNode.level + 1;
		}
		
		while( ch !== ')' ){
			next();
			if( ch === '(' ) {
				node.children.push(objectIterate(node));
			} else {
				node.children.push(object(node));
			}
		}
		
		next();
		if(ch !== ':' && ch !== ')' && ch !== ',' && ch !== ';'){
			node.type = "label";
			node.name = string();
		}
		if(ch === ':'){
			next();
			node.len = Smits.Common.roundFloat(string(), 4);
			if(node.len == 0){
				node.len = 0.0001;
			}
			node.type = "stem";

		}
		return node;		
	},
	
	string = function(){
		var string = '';
		
		while (ch !== ':' && ch !== ')' && ch !== ',' && ch !== ';'){
			string += ch;
			next();
		}
		return string;
	},

	quotedString = function(quoteType){
		var string = '';
		
		while (ch !== quoteType){
			string += ch;
			next();
		}
		return string;
	},	
	
	next = function() {
		ch = text.charAt(pos);
		pos += 1;
		return ch;
	},
	
	recursiveProcessRoot = function(node, parentNode){
		
		if(node.children && node.children.length){
			for( var i = 0; i < node.children.length; i++ ){
				var child = node.children[i];
				if(child.len === 0) {	// Dendogram
					child.len = 1;	
				}
				child.newickLen = Smits.Common.roundFloat(child.len + node.newickLen, 4);
				if(child.level > mLevel) mLevel = child.level;
				if(child.newickLen > mNewickLen) mNewickLen = child.newickLen;
				if(child.children.length > 0){
					recursiveProcessRoot(child, node); 
				}				
			}
		}
		return node;
	};

	return function(parseText){
		/* Privileged Methods */
		this.getRoot = function(){
			return root;
		};
		this.getLevels = function(){
			return mLevel;
		};
		this.getNewickLen = function(){
			return mNewickLen;
		};		
		this.getValidate = function(){
			return validate;
		};		
		
		
		/* CONSTRUCTOR */	
		mLevel = 0;
		mNewickLen = 0;
		
		text = parseText;
		pos = 0;
		
		next();
		root = objectIterate();
		root = recursiveProcessRoot(root);
	}

}();
// Smits.NewickParse("(B11MegsDCC282:0.184094,B129MegDCC902.1_:0.050786,B29MegDCC825_:0.027340,B127MegDCC9023_:0.040667,(B3MegDCC529_:0.050925,B10MegEABsn:0.015342,B13MegDHanson:0.022622,B12MegDCC526:0.014456,((B2MegEAB14a_:0.159546,(B7MegEAB137_:0.028536,B9MegEAB155_:0.088794,B27MegJAC617:0.012897,B28MegJAC6228:0.013694,B31MegEAB2005.13:0.066910,B32MegEAB2005.13:0.012860,B33MegEAB2005.43:0.026090,B36MegDCC535:0.024567,B38MegJAC6171:0.025736):0.088546):0.068294,((((B335_NZ:0.640999,(B331_NZ:0.288239,(B329_NZ:0.011058,(B323KristyNZ_DCC2531:0.009254,B323NZ_DCC2531:0.009944):0.021131):0.153143):0.278059):0.045686,B322_NZDCC2528:0.051549,B324NZ_DCC2534:0.076995,B319NZ_DCC2524:0.096112,B321NZ_DCC2527:0.899691):0.028143,B327_NZ:0.403580):0.073274,B333_NZ:0.153122):0.100109):0.131398):0.043022);");
// Smits.NewickParse("(a,b);");
Smits.NewickParse("(Calliandra_longipeicellata:0.003167,Calliandra_juzepczukii:0.000787,(Calliandra_sp:0.004151,((((((Albizia_harveyi:0.005440,((Alibizia_kalkora:0.003860,Albizia_bermudiana:0.000531,Albizia_julibrissin:0.000425)1.00:0.006081,Albizia_procera:0.008031)0.99:0.000904)1.00:0.001031,((((Acacia_tumida:0.014194,Acacia_aneura:0.001842)1.00:0.003854,Acacia_ampliceps:0.009874)1.00:0.002063,(Parachidendron_pruinosum:0.002088,Paraserthianthes_lopantha:0.002967)1.00:0.000773)0.93:0.000488,(Chloroleucon_mangense:0.000716,Chloroleucon_sp:0.002290)1.00:0.003593)0.99:0.000778)0.88:0.000547,(Pithecellobium_unguis_cati:0.004101,Ebenopsis_ebano:0.003201)1.00:0.003243,(Lysiloma_tergemina:0.010199,(Cojoba_sp:0.000608,Cojoba_filipis:0.000264)1.00:0.009552)1.00:0.002464)1.00:0.001046,((Faidherbia_albida:0.000379,Faidherbia_albida2:0.000811)1.00:0.009095,Acacia_nervosa:0.008624)1.00:0.003282)1.00:0.001256,(((Acacia_visco:0.004853,((Senegalia_skleroxylon:0.001689,Senegalia_muricarta:0.001307)1.00:0.003698,Senegalia_vogelianan:0.011940)0.88:0.000882)0.84:0.000507,(((((Prosopsis_sp:0.012867,(Neptunia_monosperma:0.011880,(Desmanthus_sp:0.006976,Leucaena_leucosephala:0.006861)1.00:0.004129)1.00:0.003137)1.00:0.001891,(((((Vachellia_macracantha:0.001674,(Vachellia_cornigera:0.000590,Vachellia_collinsii:0.002486,Vachellia_choriophylla:0.000574)1.00:0.001299)1.00:0.002111,(Vachellia_cucuyo:0.001248,Vachellia_oveidoensis:0.000601)1.00:0.001167)0.99:0.000896,Vachellia_schaffneri:0.003589)0.97:0.000701,(Vachellia_neovenicosa:0.000463,Vachellia_constricta:0.000589)1.00:0.001723)1.00:0.001083,(Vachellia_grandicornata:0.003547,Vachellia_nilotica:0.002454,Vachellia_hockii:0.002850)1.00:0.002707)1.00:0.011088)0.88:0.000526,(Piptadenia_viridflora:0.013244,(Anadenenthara_columbrina:0.001842,Anadenanthera_peregrina:0.004852)1.00:0.007572)0.98:0.000822)1.00:0.001682,(Mimosa_foetida:0.013358,Mimosa_casta:0.033822)0.68:0.000938)1.00:0.002821,((Senegalia_mellifera:0.001294,Senegalia_galpinii:0.002199)1.00:0.008216,((((Senegalia_soraria:0.001112,(Senegalia_gaumeri:0.000839,Senegalia_picachensis:0.000665)1.00:0.004074)0.56:0.000697,Senegalia_fructispina:0.006561)0.94:0.000996,Senegalia_brevispica:0.006060)1.00:0.003318,Senegalia_occidentalis:0.005647)1.00:0.004437)1.00:0.001206)0.99:0.001003)0.74:0.000393,((Mariosousa_coulteri:0.001464,Mariosousa_dolichiostachya:0.002672)1.00:0.001836,Mariosousa_millefolia:0.002144)1.00:0.000776)1.00:0.001732)0.97:0.001231,((Acaciella_tequilana:0.000185,Acaciella_anugstisima:0.000961)1.00:0.004965,Acaciella_glauca:0.002742)1.00:0.012247)1.00:0.026210)1.00:0.003217);");
// Smits.NewickParse("(((((((((((((1,44),(17,(63,106))),101),((45,62),73)),(74,78)),(9,93)),(42,52)),((((((2,33),11),(4,12)),(((((((((((((5,(35,(46,94))),36),97),(96,104)),(16,69)),((19,56),((20,(41,86)),(83,92)))),((((13,79),((25,82),68)),((15,((107,108),113)),103)),((34,(48,(77,100))),105))),((38,(40,61)),72)),((((32,70),116),60),(37,51))),((((14,95),98),(31,(50,85))),111)),((((((6,28),8),110),7),(39,53)),((30,90),64))),(76,117)),26)),(((24,102),114),87)),(((10,((((22,65),81),112),(((27,71),115),67))),75),((21,54),57)))),(47,49)),(((18,29),(((((43,58),84),109),59),89)),(80,99))),((23,66),88)),(55,91)),3))");
// Smits.NewickParse("(Gonatus_fabricii:0.098985,Gonatopsis_borealis:0.134561,(Alluroteuthis_antarcticus:0.148348,((Teuthowenia_megalops:0.151292,(Illex_coindetii:0.210762,(Metasepia_tullbergi:0.391530,(Loliolus_sp.:0.144545,Photololigo_sp.:0.277772):0.127297):0.069563):0.049351):0.067434,Joubiniteuthis_sp.:0.196256,Psychroteuthis_glacialis:0.212315,Moroteuthis_knipovitchi:0.193672,(Pterygioteuthis_microlampas:0.281967,Lycoteuthis_lorigera:0.207192):0.073333,Bathyteuthis_berryi:0.165907,Octopus_ornatus:0.579537):0.041197):0.092935);");
// Smits.NewickParse("(Acacia_parach:0.1238535,(Acacia_paraser:0.646114,((Acacia_victoriae:0.42759500000000006,(Acacia_dempsteri:0.187512,Acacia_pyrifolia:0.12982800000000005):0.08194299999999999):0.21501400000000004,(((Acacia_alata:0.35306400000000004,(Acacia_saligna:0.10582400000000003,Acacia_saligna:0.06461700000000004):0.21633999999999998):0.08363799999999999,(Acacia_extensa:0.28929799999999994,((Acacia_rostellifera:0.245108,(Acacia_cupularis:0.039309999999999956,Acacia_ligulata:0.02492300000000003):0.19357899999999995):0.22407599999999994,(Acacia_pravifolia:0.27304800000000007,((Acacia_adoxa:0.05807399999999996,Acacia_perryi:0.06811599999999995):0.2606519999999999,((Acacia_leioderma:0.09380500000000003,Acacia_pentadenia:0.09877999999999998):0.218746,(Acacia_hemiteles:0.08961200000000002,Acacia_guinetii:0.11649100000000001):0.20321999999999996):0.11906499999999998):0.03101300000000007):0.03586199999999995):0.048131000000000035):0.02978499999999995):0.06725000000000003,(((Acacia_suaveolens:0.595355,Acacia_triquetra:0.349507):0.06649000000000005,(Acacia_subrigida:0.33091000000000004,(Acacia_murrayana:0.271116,Acacia_pachyacra:0.08749700000000005):0.09907100000000002):0.17799300000000007):0.06937499999999996,((((Acacia_baeuerlenii:0.14029000000000003,Acacia_melanoxylon:0.16516799999999998):0.04455399999999998,((Acacia_cognata:0.298748,Acacia_flexifolia:0.06810700000000003):0.039027000000000034,(Acacia_venulosa:0.10495200000000005,Acacia_viscidula:0.12380199999999997):0.03825400000000001):0.01595599999999997):0.11580999999999997,((Acacia_floribunda:0.15847300000000003,Acacia_triptera:0.13394199999999995):0.02024699999999996,(Acacia_multispicata:0.147733,((Acacia_abbreviata:0.175033,Acacia_crassicarpa:0.10139299999999996):0.06082900000000002,((Acacia_aneura:0.06850299999999998,Acacia_aneura:0.185102):0.11921999999999999,(Acacia_gonoclada:0.13806600000000002,Acacia_holosericea:0.09942899999999999):0.047653999999999974):0.023492999999999986):0.032843999999999984):0.05070999999999992):0.046435000000000004):0.04352299999999998,(((Acacia_beckleri:0.07366899999999998,Acacia_pycnantha:0.07797299999999996):0.03950200000000004,(Acacia_hakeoides:0.06449499999999997,Acacia_hakeoides:0.05915199999999998):0.04348099999999999,(Acacia_euthycarpa:0.067473,(Acacia_anceps:0.09021299999999999,(Acacia_amblyophylla:0.191411,Acacia_meissneri:0.036506999999999956):0.023009000000000057):0.034943999999999975):0.009916000000000036):0.024106000000000016,(((Acacia_cultriformis:0.051591000000000053,Acacia_falcata:0.067639):0.036248999999999976,(Acacia_neriifolia:0.05405700000000002,Acacia_pravissima:0.08901599999999998):0.035804999999999976):0.01113900000000001,((Acacia_penninervis:0.010780000000000012,Acacia_penninervis:0.013546999999999976):0.027490000000000014,(Acacia_dorothea:0.04428500000000002,((Acacia_dealbata:0.013597999999999999,Acacia_dealbata:0.04765799999999998):0.06518100000000004,(Acacia_linifolia:0.053427,Acacia_spectabilis:0.07935999999999999):0.03228399999999998,(Acacia_muelleriana:0.05095799999999995,(Acacia_deanei:0.029395999999999978,Acacia_mearnsii:0.04198500000000005,Acacia_mearnsii:0.009386000000000005):0.025534000000000057):0.009724999999999984):0.011299999999999977):0.025370000000000004):0.022839000000000054):0.08552600000000005):0.14326599999999995):0.12480200000000008):0.04425599999999996):0.03506100000000001):0.139725):0.1238535);");
// var jsonObject = Smits.getRoot().json();
// Smits.
// alert(tree);
