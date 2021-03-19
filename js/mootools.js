var mooSelect = new Class({
    Implements: [Options, Events],
    options: {
        //start_txt:'- select options -',
        inititalText:'- select -',  //  the initial default text (will be overwridden if the select list has it's own)
        txt: 'options selected',    //  text for counter
        auto_close:true,            //  to close or not to close the checklist
        auto_close_time:5000        //  time to close the list
    },
    initialize: function(element,options){
        this.setOptions(options);
        var counter         =   0;
        var state           =   false;
        var select_box      =   $(element);
        var select_options  =   select_box.getElements('option');
        var field_name      =   select_box.getProperty('name');
        var selected_items  =   select_box.getSelected();
        var auto_close      =   this.options.auto_close;
        var auto_close_time =   this.options.auto_close_time;
        var initial_txt     =   this.options.inititalText;
         
        //create checklist from select list options
        var chk_items = '';
        var chk='';
        var initial_number='';
         
        select_options.each(function(option) {
            //  define select option value and text value
            opt_val=option.get('value');
            opt_txt=option.get('text');
             
            //  define default initial text (if it is set)
            if(opt_val=='')initial_txt      = opt_txt;
             
            //  check if item is selected
            checked='';
            if(option.get('selected')){
                checked='checked="checked"';
                counter=counter+1;  //  add 1 to counter
            }
             
            //  define number and text if
            if(counter>0) {
                initial_txt     = options.txt;
                initial_number  = counter;
            }
            //  add checkbox if value isn't empty
            if(opt_val!='')chk_items += '<label><input type="checkbox" class="sel_checkbox" name="'+field_name+'[]" '+checked+' value="'+opt_val+'">'+opt_txt+'</label><br>';
        });
        chk_items +='<div class="select_close" title="close">x</div>';
         
         
        //  create new div to hold selected items counter and acts as toggle for checkbox list
        var pseudo_select=new Element('div',{
            'class':'pseudo_select',
            'html':'<span class="counter">'+initial_number+'</span> <span class="text">'+initial_txt+'</span>',
            events: {
                click: function(e) {
                    //alert(auto_close_time);
                    state = !state;
                    if(auto_close){
                        if(state) sel_list.wink(auto_close_time);
                    }else{
                        if(state) sel_list.reveal();
                        else sel_list.dissolve();
                    }
                }
            }
        }).setStyle('cursor','pointer').inject(select_box,'after');
         
        //create select list
        var sel_list = new Element('div',{
            'class': 'select_list',
            'html':chk_items
        }).inject(pseudo_select,'after'); 
         
        //  delete original select box
        select_box.dispose();
         
        //  hide new select list
        sel_list.dissolve();
         
        //  close button
        sel_list.getElement('.select_close').addEvent('click',function(){
            sel_list.dissolve();
        });
         
        //  click options on select list
        var sel_checkboxes=sel_list.getElements('.sel_checkbox');
        sel_checkboxes.addEvent('click',function(){
            //  count checked checkboxes
            chk=0;
            for(var i=0;i<sel_checkboxes.length;i++){
                sel_checkboxes[i].checked? chk++:null;
            }
            if(chk==0) {
                pseudo_select.getElement('.text').set('html',''+initial_txt+'');
                pseudo_select.getElement('.counter').set('html','');
            }else{
                pseudo_select.getElement('.text').set('html',''+options.txt+'');
                pseudo_select.getElement('.counter').set('html',chk);
            }
        });
    }
 });