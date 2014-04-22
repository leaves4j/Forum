﻿/**
 * Created by jiangqiang on 14-4-18.
 */
/**
*主题列表控制器
*/
app.controller( 'topicListCtrl', ['$scope', 'Topic', 'PubFunc', 'Sidebar', function ( $scope, Topic, PubFunc, Sidebar ) {
    $scope.dealDate = PubFunc.dateToPre;

    $scope.TotalItems = 0;
    $scope.CurrentPage = 1;
    $scope.maxSize = 5;

    $scope.isLogin = false;
    $scope.isAdmin = false;
    $scope.$on( 'UserStatus', function ( event, msg ) {
        $scope.isLogin = msg.isLogin;
        $scope.isAdmin = msg.isAdmin;
    });
    $scope.$emit( 'getUserStatus', '' );
    Sidebar.setSidebar( 'noReply' );

    $scope.getData = function () {
        Topic.query( { page: $scope.CurrentPage, typeId: '123123' },
            function ( data ) {
                $scope.topicList = data.doc;
                $scope.TotalItems = data.count;
            });
    }
    $scope.getData();
}] )
/**
*主题详细控制器
*/
app.controller( 'topicDetailCtrl', ['$scope', '$sanitize', '$routeParams', 'Topic', 'Reply', function ( $scope, $sanitize, $routeParams, Topic, Reply ) {
    var replyListData = [];
    Topic.get( { topicId: $routeParams.id }, function ( _topic ) {
        $scope.topicDetail = _topic;
        $scope.contentHtml = markdown.toHTML( _topic.contents );
    });
    Reply.query( { topicId: $routeParams.id }, function ( _reply ) {
        replyListData = _reply;
        $scope.replyList = formatReply( _reply );
    })
    var reply = new Reply();
    $scope.replyTopic = function () {
        reply.replyTopic = $routeParams.id;
        reply.contents = $scope.reply.contents;
        reply.$save( function ( _reply ) {
            replyListData.push( _reply )
            $scope.replyList = formatReply( replyListData );
            $scope.reply.contents = '';
        })
    };
    $scope.isLogin = false;
    $scope.isAdmin = false;
    $scope.$on( 'UserStatus', function ( event, msg ) {
        $scope.isLogin = msg.isLogin;
        $scope.isAdmin = msg.isAdmin;
    });
    $scope.$emit( 'getUserStatus', '' );
    function formatReply( reply ) {
        var _reply = [];
        for ( var i = 0; i < reply.length; i++ ) {
            reply[i].contentHtml = markdown.toHTML( reply[i].contents );
            if ( reply[i].replyTo == undefined ) {
                _reply.push( reply[i] )
            }
            else {
                var index = getReplyIndex( _reply, reply[i], 0, _reply.length );
                if ( index != null ) {
                    if ( _reply[index].childReply == undefined )
                        _reply[index].childReply = [];
                    _reply[index].childReply.push( reply[i] )
                }
            }
        }
        return _reply;
    }
    function getReplyIndex( replyList, reply, start, end ) {
        var middle = parseInt( ( end + start ) / 2 );
        if ( replyList[middle] == reply.replyTo )
            return middle;
        else if ( replyList[middle] < reply.replyTo )
            return getReplyIndex( replyList, reply, middle, end )
        else if ( replyList[middle] > reply.replyTo )
            return getReplyIndex( replyList, reply, start, middle )
        else
            return null;
    }
}] );
/**
*主题编辑控制器
*/
app.controller( 'topicEditCtrl', ['$scope', '$sanitize', '$routeParams', '$location', 'Topic', 'Message',
    function ( $scope, $sanitize, $routeParams, $location, Topic, Message ) {
        var isNew = false;

        if ( !$routeParams.id ) {
            $scope.topicDetail = new Topic();
            $scope.topicDetail.contents = '你可以使用 **Markdown** 在这里进行编写';
            isNew = true;
        }
        else {
            $scope.topicDetail = Topic.get( { topicId: $routeParams.id });
            isNew = false
        }
        $scope.$watch( 'topicDetail.contents', function () {
            $scope.contentHtml = markdown.toHTML( $scope.topicDetail.contents );
        });
        $scope.save = function () {
            if ( isNew ) {
                $scope.topicDetail.creatTime = new Date();
            }
            else {
                $scope.topicDetail.editTime = new Date();
            }
            $scope.topicDetail.$save( function ( data ) {
                Message.success( '发布成功' );
                $location.path( '/Topic/' + data._id );
            }, function ( data ) {
                    Message.error( '发布失败，错误：' + data.error );
                })
        }
}] )
