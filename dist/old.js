/**
 * Created by wrain on 2016/8/26.
 */
define(function (require,exports,module) {
    var sTpl = require("templates/common/vue-table.html");
    var Ajax = require("js/lib/mod-ajax.js");
    // 注册组件，传入一个扩展的构造器
    Vue.component('vue-table', Vue.extend({
        template: sTpl
        ,props:{
            "tableName":String
            ,"apiUrl":String
            ,"tableSet":{
                type:Boolean,
                default:function(){
                    return true;
                }
            }
            ,tableOpt:{
                type:Object,
                default:function(){
                    return {
                        footShow:true
                    }
                }
            }
            ,checkCol:{
                type:Boolean,
                default:function(){
                    return true;
                }
            },
            "multiSelect":{
                type:Boolean,
                default:function(){
                    return true;
                }
            },
            "searchParams":{
                type:Object,
                default:function(){
                    return {}
                }
            }
            ,"columns":Array
            ,"limit":{
                type:Array,
                default:function(){
                    return [10,20,50,100];
                }
            }
            ,"nodataText":{
                type:String,
                default:"暂无数据"
            }
            ,"dblclickFun":Function
            ,"clickFun":Function
            ,"checkboxFun":Function
            ,"callbackFun":Function
         }
        ,data:function(){
            return {
                tableData:new Array,
                dataCount:0,
                pageCount:0,
                tableLoading:true,
                checkedAll:false,
                wacthParams:this.searchParams,
                pagerParams:{
                    "pageBean.pageNo" : 1,
                    "pageBean.pageSize" : this.limit[0]
                },
                TimeFun:null
            };
        },
        ready:function(){
            var vm = this;
            vm.loadData();
        }
        //计算属性
        ,computed:{
            //计算列显示总数
            columnsCount:function(){
                var vm = this; var count = 0;
                for(var i=0;i<vm.columns.length;i++){
                    var child = vm.columns[i].child;
                    if(child && vm.columns[i].visible){
                        for(var j=0; j<child.length; j++){
                            child[j].visible && count++;
                        }
                    }else{
                         vm.columns[i].visible && count++;
                    }
                }
                vm.checkCol && count ++;
                return count;
            },
            //计算分页按钮
            pagerList:function(){
                var vm = this , a = vm.pagerParams['pageBean.pageNo'] * 1;
                var list = new Array();
                if( a<=4 && a<=vm.pageCount){
                    for(var i = 1; i<=(vm.pageCount>8 ? 7 : vm.pageCount ); i++){
                        list.push(i);
                    }
                }else if(a>(vm.pageCount-4) && a<=vm.pageCount ){
                    for(var i = vm.pageCount-6; i<=vm.pageCount; i++){
                        if(i>0){
                            list.push(i);
                        }
                    }
                }else if(a>4 && a<=vm.pageCount-4) {
                    for(var i = a-3; i<a+4; i++){
                        list.push(i);
                    }
                }
                return list;
            }
        }
        ,filters:{
            //计算 colspan 数量
            visibleChild:function(a,b){
                var c = 0;
                for(var i=0; i<b.length; i++){
                    b[i].visible && c++;
                }
                return c;
            }
        }
        ,methods:{
            //加载数据
            loadData:function(param){
                var vm = this , t = {};
                var params = $.extend({},vm.searchParams,vm.pagerParams,param);
                Ajax.ajax({
                    url: vm.apiUrl,
                    data:params,
                    beforeSend:function(){
                        vm.tableData =[];
                        //加载动画
                        vm.tableLoading = true;
                        NProgress.inc();
                    },
                    error:function(){
                        vm.tableLoading = false;
                        NProgress.done();
                        vm.getChecked();
                    },
                    callback:function(data){
                        NProgress.done();
                        vm.tableLoading = false;
                        $(data.beans).each(function(){this._checked=false});
                        vm.tableData = data.beans;
                        if(!data.pb) return false;
                        if(data.pb.pageNo && data.pb.pageNo!=0) vm.pagerParams["pageBean.pageNo"] = data.pb.pageNo * 1;
                        vm.dataCount = data.pb.pageDataCount * 1;
                        vm.pageCount = data.pb.pageCount * 1;
                        vm.getChecked();

                        setTimeout(function(){
                            $("[data-toggle='tooltip']").tooltip();
                        }, 500);
                    }
                });
            },
            //单击事件
            clickFuc:function(item,$event,index){
                var vm = this , a = new Array;
                if($event.target.tagName=="INPUT"||$event.target.className=="no-click"){
                    return false;
                }else if($event.target.className.indexOf("click-fun")!=-1){
                    //清除定时器 定时器区分单击和双击
                    clearTimeout(vm.TimeFun);
                    vm.TimeFun = setTimeout(function(){
                        typeof(vm.clickFun)== "function" && vm.clickFun(item,$event);
                    },300);
                }else{
                    //item._checked = !item._checked;
                    //判断是否支持多选
                    if(vm.multiSelect){
                        item._checked = !item._checked;
                    }else{
                        $(vm.tableData).each(function(i){
                            if(i==index){
                                vm.tableData[index]._checked = true;
                            }else{
                                vm.tableData[i]._checked = false;
                            }
                        });
                    }
                    $(vm.tableData).each(function(){
                        this._checked && a.push(this);
                    });
                    vm.tableData.length == a.length ? vm.checkedAll = true : vm.checkedAll = false;
                    vm.getChecked();
                }
            },
            //双击事件
            doubleClick:function(item,$event){
                var vm = this;
                clearTimeout(vm.TimeFun);
                typeof(vm.dblclickFun)== "function" && vm.dblclickFun(item,$event);
            },
            callbackFun:function(){
                
            },
            //表格设置
            setOption:function(){
                var vm = this;
                $(".modal-"+vm.tableName).modal();
            },
            //列显示隐藏
            columnsDisplay:function(a,b){
                var vm = this ; var c = 0;
                a.visible = !a.visible;
                if(b==undefined){
                    if(a.visible){
                        $(a.child).each(function(){
                            this.visible = true;
                        });
                    }else{
                        $(a.child).each(function(){
                            this.visible = false;
                        });
                    }
                }else{
                    $(b.child).each(function(){
                        if(!this.visible) { c++ };
                    });
                    if(b.child.length == c){
                        b.visible = false;
                    }else{
                        b.visible = true;
                    }
                }
            },
            //复选框勾选
            checkEvent:function(index,$event){
                var vm = this , a = new Array;
                //判断是否支持多选
                if(vm.multiSelect){
                    $event.currentTarget.checked ? vm.tableData[index]._checked = true : vm.tableData[index]._checked = false;
                }else{
                    if($event.currentTarget.checked){
                        $(vm.tableData).each(function(i){
                            if(i==index){
                                vm.tableData[index]._checked = true;
                            }else{
                                vm.tableData[i]._checked = false;
                            }
                        });
                    }else{
                        vm.tableData[index]._checked = false;
                    }
                }
                $(vm.tableData).each(function(){
                    this._checked && a.push(this);
                });
                vm.tableData.length == a.length ? vm.checkedAll = true : vm.checkedAll = false;
                vm.getChecked();
                typeof(vm.checkboxFun)=="function" && vm.checkboxFun(a);
            },
            //全选
            checkAllEvent:function($event){
                var vm = this, a = new Array;
                if($event.currentTarget.checked){
                    $(vm.tableData).each(function(){
                        this._checked = true;
                        a.push(this);
                    });
                    vm.checkedAll = true;
                }else{
                    $(vm.tableData).each(function(){
                        this._checked = false;
                    });
                    vm.checkedAll = false;
                }
                vm.getChecked();
                typeof(vm.checkboxFun)=="function" && vm.checkboxFun(a);
            },
            //获取已选中的数据
            getChecked:function(){
                 var vm = this, a = new Array;
                $(vm.tableData).each(function(){
                    this._checked && a.push(this);
                });
                vm.checkedItems = a;
                if(vm.checkedItems.length==0) vm.checkedAll = false;
                return a;
            }
        }
        //监控数据改变
        ,watch:{
            //当分页数据改变时 刷新表格
            "pagerParams": {
                handler: function (val,oldVal) {
                    this.loadData();
                },
                deep: true
            },
            //当搜索条件改变时 刷新表格
            'wacthParams':{
                handler: function (val,oldVal) {
                    this.loadData();
                },
                deep: true
            },
            //当表格URL发生变化时 重载表格
            'apiUrl':{
                handler: function (val,oldVal) {
                    this.loadData({});
                },
                deep: true
            }
        }
    }));

});

