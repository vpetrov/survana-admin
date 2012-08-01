define([
			'jquery',
			'underscore',
			'backbone',
			'jquery-ui',
			'bootstrap',
			'models/form/list/proxy'
		],
function($,_,Backbone,jQueryUI,bootstrap,FormListProxy)
{
    return Backbone.View.extend({
        proxyCollection:null,
        template:_.template($('#tpl-study-forms').html()),
        itemTemplate:_.template($('#tpl-study-forms-item').html()),
        titleTemplate:_.template($('#tpl-study-forms-title').html()),
        menuTemplate:_.template($('#tpl-form-version-menu').html()),

        sortStartedAt:-1,
        sortStoppedAt:-1,

        initialize:function(options){
        	console.log('Initializing StudyFormsView',options);
            _.bindAll(this,'render','onItemInserted','getModel','getForms','sortStarted','sortEnded','insert','onMenuItemSelect',
            		  'onDragOut','onDragIn', 'onDragStop');

            this.collection.on("change",this.render);

            //proxy model
            this.proxyCollection=new FormListProxy();
            //this.render(this.collection);
        },

        events:{
        	'click a[data-form-id]': 	'onMenuItemSelect'
        },

        render:function(model)
        {
            var items;

            if (this.proxyCollection.length)
            	items=this.proxyCollection.toJSON();
            else
            	items=[];

            //create template
            $(this.el).html(this.template({
                'items':items,
                'itemTemplate':this.itemTemplate,
                'titleTemplate':this.titleTemplate,
                'menuTemplate':this.menuTemplate
            }));

            //sortable list properties
            this.$('.sortable-list').sortable({
                'revert': 		false,
                'distance': 	10,
                'receive': 		$.proxy(this.onItemInserted,this),
                'start': 		$.proxy(this.sortStarted,this),
                'beforeStop': 	$.proxy(this.sortEnded,this),
                'stop': 		$.proxy(this.updateIndexes,this),
                'out':          $.proxy(this.onDragOut,this),
                'over': 		$.proxy(this.onDragIn,this)
            })

            //disable user select (conflicts with dragging)
            $('.sortable-list').disableSelection();

            return this;
        },

        onItemInserted:function(e,ui)
        {
        	var id=ui.item.children('a[data-form-id]').attr('data-form-id');
        	var model=this.collection.get(id);
        	var el=this.$('li.draggable').not('.active');

        	this.proxyCollection.add({
        		'index':this.sortStartedAt,
        		'form':model
        	});

        	this.replace(el,this.sortStartedAt,id);
        },

        replace:function(item,index,id)
        {
        	var model=this.collection.get(id);
        	var proxyModel=this.proxyCollection.where({'index':index});

        	if (typeof model==='undefined' || !model)
        	{
        		console.error('Could not find model with ID',id);
        		return false;
        	}

        	if (proxyModel.length>1)
        	{
        		console.error('Consistency error: Found more than 1 item at position',index,proxyModel);
        		return false;
        	}

        	var group=this.collection.
        				//find all forms belonging to this gid
        				where({'gid':model.get('gid')}).
        				//convert all results to JSON
						map(function(item){
								return item.toJSON()
						});

			//sort in descending order of creation time
			group.sort(function(a,b){return b['created_on']-a['created_on']});

			//replace the form model in the current proxy model
			if (proxyModel.length)
				proxyModel[0].set('form',model);
			else
				//add a new model to the proxy collection
	        	this.proxyCollection.add({
	        		'index':index,
	        		'form':model
	    		});

    		var el=$(this.itemTemplate({
            	'item':model.toJSON(),
            	'group':group,
            	'titleTemplate':this.titleTemplate,
            	'menuTemplate':this.menuTemplate
        	}));

    		//replace the placeholder with the real item
            $(item).replaceWith(el);
       },

        insert:function(e)
        {
        	el=$(e.currentTarget); //e.target could be a span inside an <a> element

        	var id=el.attr('data-form-id');
        	var model=this.collection.get(id);

        	if (!model)
        		return false;
			var item=el.parent('li').clone();
        	this.$('#study-forms').append(item);

        	this.replace(item,item.index(),id);

        	//prevent the browser from changing the page
        	e.preventDefault();
        	return false;
        },

        removeItem:function(item)
        {
        	console.log('Removing item',item);
        },

        sortStarted:function(e,ui)
        {
        	this.sortStartedAt=ui.item.index();
        },

        sortEnded:function(e,ui)
        {
        	this.sortStoppedAt=ui.item.index();
        },

        updateIndexes:function(e,ui)
        {
			var from=this.sortStartedAt;
			var to=this.sortStoppedAt;

			//console.log('Initial: ',from,to);

        	//var new_index=ui.item.index();
        	//var model=this.proxyCollection.where({'form-id':ui.item.attr('data-form-id')});

        	/* TODO: this function doesn't work properly for now. */
        	this.proxyCollection.each(function(item){
				var idx=item.get('index');

				//if an item was moved up
				if (from>=to)
				{
					//change index to destination
					if (idx==from)
						item.set('index',to);
					//all items in between are incremented
					else if (idx>=to && idx<from)
						item.set('index',idx+1);

					//other elements are ignored
				}
				//if an item was moved down
				else
				{
					if (idx==from)
						item.set('index',to);
					else if (idx<=to && idx>from)
						item.set('index',idx-1);
				}
        	});

        	this.proxyCollection.sort({silent:true});

			console.log(from,to,this.proxyCollection.map(function(item){
				var form=item.get('form');
        		return item.get('index')+':'+form.get('code')+'/'+form.get('version');
        	}));

        	this.sortStartedAt=-1;
        	this.sortStoppedAt=-1;
        },

        getModel:function()
        {
        	return this.proxyCollection;
        },

        getForms:function()
        {
        	//convert all results to JSON
			return this.proxyCollection.map(function(item){
					return item.get('form').toJSON()
			});
        },

        onMenuItemSelect:function(e){
        	var el=$(e.currentTarget);

        	var id=el.attr('data-form-id');
			var item=el.parents('li.active.dropdown');

			this.replace(item,item.index(),id);

			e.preventDefault();
			return false;
        },

        onDragOut:function(e,ui)
        {
        	console.log('drag out: adding class');
        	$(ui.helper).find('a.dropdown').addClass('build-form-remove');
        	$(ui.helper).on('mouseup',$.proxy(this.onDragStop,this));
        },

        onDragIn:function(e,ui)
        {
        	console.log('drag in: removing class');
			$(ui.helper).find('a.dropdown').removeClass('build-form-remove');
        },

        onDragStop:function(e)
        {
        	var item=$(e.currentTarget);
        	item.off('mouseup');

        	var handle=item.children('a.dropdown');

    		if (handle.hasClass('build-form-remove'))
    		{
    			handle.removeClass('build-form-remove');
    			this.removeItem(item);
    		}
        }
    });

}); //define
