define([
			'jquery',
			'underscore',
			'backbone',
			'jquery-ui'
		],
function($,_,Backbone)
{
    //List of all groups
    return Backbone.View.extend({
        template:_.template($('#tpl-form-list').html()),
        itemTemplate:_.template($('#tpl-form-list-item').html()),
        
        clickHandler:null,
        
        initialize:function(options){
        	console.log('Initializing FormGroupView',options)
            _.bindAll(this,'render','addItem','draggable');
            
            this.collection.on("change reset",this.render);
            this.collection.on("add",this.addItem)
        },
        
        render:function(model){
            $(this.el).html(this.template({
            	//group items by group_id
                'items':_.groupBy(this.collection.toJSON(),'gid'),
                'itemTemplate':this.itemTemplate
            }));
            this.draggable();
            this.addClickHandler();
            return this;
        },
        
        addItem:function(newitem,model){
            this.$('#form-list').append(this.itemTemplate({
            	'id'	:	newitem.get('id'),
            	'group' :  newitem.get('group')
            	}));
            console.log('reginstering click handler',this.clickHandler);
            this.addClickHandler();
            return this;
        },
        
        addClickHandler:function()
        {
        	console.log('registering click handler');
        	this.$('#form-list').find('a').click(this.clickHandler);
        },
        
        draggable:function()
        {
            this.$('.draggable').draggable({
                helper:"clone",
                revert:"invalid",
                connectToSortable:".sortable-list",
                delay:300
            });
        },
        
        click:function(fn)
        {
        	this.clickHandler=fn;
        },
        
        handleChange:function(){
            console.log("stuff has changed");
        }
    });
    
}); //define