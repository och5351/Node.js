$(document).ready(function () {
    
    //로그인 확인
    $('#login_form').submit(function (event) {
        // Ajax 요청을 수행합니다.

        //$('.login').load('/login', $(this).serializeArray());
        //location.href('http://127.0.0.1:52273/');
      
        // 기본 이벤트를 제거합니다.
        //event.preventDefault();
    });

    //카테고리 데이터 출력
    


    //회원가입 이용약관 동의 확인
    $('#signAgreeBtn').on('click',function(event){
        if(!($('#signCheck').is(":checked") == true && $('#signCheck2').is(":checked") == true)){
            event.preventDefault();
            alert('필수 약관에 모두 동의 하셔야 가입하실 수 있습니다.');
        }
    });

    var rFail = 1; //회원가입 변수

    //회원가입 아이디 확인
    $('#idCheckBtn').on('click',function(event){
        if($('#sId').val() != ''){
            $.ajax({
                url: '/signUp/check',
                type: 'put',
                dataType: 'text',
                data: {
                    id: $('#sId').val()
                },
                success: function (data) {
                    if(data == 2){
                        rFail = 1;
                        $('#idCheckD').empty();
                        $('#idCheckD').append('<small>아이디가 중복 됩니다.</small>');
                        $('#idCheckD').css('color', 'red');
                    }else{
                        rFail = 0;
                        $("#sId").attr( 'disabled', true );
                        $('#idCheckD').empty()
                        $('#idCheckD').append('<small>사용 가능한 아이디 입니다.</small>');
                        $('#idCheckD').css('color', 'blue');
                    }                
                }            
            });
            event.preventDefault()
        }else{
            $('#idCheckD').empty();
            $('#idCheckD').append('<small>아이디를 입력해주세요.</small>');
            $('#idCheckD').css('color', 'red');
        }
    });

    //회원가입 비밀번호 확인
    $(document).on('keyup','#resPw', function(){
       if($('#sPw').val() != $('#resPw').val()){
            $('#resPwResult').empty();
            $('#resPwResult').append('<small>비밀번호가 일치하지 않습니다.</small>');
            $('#resPwResult').css('color', 'red');

       }else{
            $('#resPwResult').empty();
            $('#resPwResult').append('<small>비밀번호가 일치합니다.</small>');
            $('#resPwResult').css('color', 'blue');
       }
    });

    //회원가입란 모두 입력하였는지 확인
    $('#registerSubmitBtn').on('click',function(event){
        var id = $('#sId').val();
        var pw = $('#sPw').val();
        var rePw = $('#resPw').val();
        var name = $('#sName').val();
        var register = $('#sRegister').val();
        var phone = $('#sPhone').val();


        if(id==''||pw==''||rePw==''||name==''||register==''||phone==''||(pw != rePw)){
            event.preventDefault();
            alert('모든 정보를 입력하여주세요. \n모든 정보를 입력하셨다면 비밀번호를 확인해주세요.');
        }else if(rFail == 1){
            event.preventDefault();
            alert('아이디 중복 확인을 해주세요.');
        }else{
            $("#sId").attr( 'disabled', false );
        }
    });

    //아이디 영어만 입력
    $(document).on("keyup", "#sId", function() {
        $(this).val( $(this).val().replace(/[^a-z0-9]/gi,"") );
    });

    //공지작성
    $('#noticeSubmit').on('click', function(){
        if(confirm('공지를 작성 하시겠습니까?')==true){
            $.ajax({
                url: '/notices/noticeAddAdd',
                type: 'post',
                dataType: 'text',
                data: {
                    title: $('#noticeTitle').val(),
                    contents: $('#noticeContents').val()
                },
                success: function (data) {
                    event.preventDefault();
                    alert('공지 작성을 성공하였습니다.');
                    location.href = '/notices';
                }
            });        
        }else{
            event.preventDefault();
        }
          
    });

    //게시글 작성
    $('#communitySubmit').on('click', function(){
        if(confirm('게시글을 작성 하시겠습니까?')==true){
            $.ajax({
                url: '/community/communityAddAdd',
                type: 'post',
                dataType: 'text',
                data: {
                    title: $('#communityTitle').val(),
                    contents: $('#communityContents').val()
                },
                success: function (data) {
                    event.preventDefault();
                    alert('게시글 작성을 성공하였습니다.');
                    location.href = '/community';
                }
            });        
        }else{
            event.preventDefault();
        }
          
    });

    //공지삭제
    $('#noticeDelete').on('click',function(event){
        if(confirm('공지를 삭제 하시겠습니까?')==true){
            $.ajax({
                url: '/notices/noticeDelete',
                type: 'post',
                dataType: 'text',
                data: {
                    seq: seq
                },
                success: function (data) {
                    alert('공지 삭제를 성공하였습니다.');
                    location.href = '/notices';
                }
            });        
        }else{
            event.preventDefault();
        }
    });

    //게시글삭제
    $('#communityDelete').on('click',function(event){
        if(confirm('게시글을 삭제 하시겠습니까?')==true){
            $.ajax({
                url: '/community/communityDelete',
                type: 'post',
                dataType: 'text',
                data: {
                    seq: seq
                },
                success: function (data) {
                    alert('게시글 삭제를 성공하였습니다.');
                    location.href = '/community';
                }
            });        
        }else{
            event.preventDefault();
        }
    });


    //강의구매 버튼
    $('#accessSubject').on('click',function(event){
        if(loginSess == '0'){
            location.href= '/login';
            alert('로그인 후 진행하여주세요');
            
        }else{
            if(confirm('강의를 구매/신청 하시겠습니까?')==true){
                $.ajax({
                    url: '/market/buy',
                    type: 'post',
                    dataType: 'text',
                    data: {
                        code: mDCode,
                        seq: seq
                    },
                    success: function (data) {
                    alert('구매/신청에 성공하였습니다.');
                    location.href = '/market/marketDetail/'+seq;
                    }
                });
            
            }else{
                event.preventDefault();
            }
        }   
    });

    //강의 신청 취소 버튼
    $('#deleteSubject').on('click',function(event){
        
        if(confirm('강의 신청을 취소 하시겠습니까?')==true){
            $.ajax({
                url: '/market/buyCancel',
                type: 'post',
                dataType: 'text',
                data: {
                    title : mDTitle,
                    name: mDName,
                    code: mDCode,
                    seq: seq
                },
                success: function (data) {
                    alert('강의 신청 취소에 성공하였습니다.');
                    location.href = '/market/marketDetail/'+seq;
                }
            });
        
        }else{
            event.preventDefault();
        }
    });

    //회원정보 수정 
    $("#eUpdate").on('click',function(){
        if(confirm('수정하신 내용을 반영하시겠습니까?')==true){
            $.ajax({
                url: '/admin/memManage/update',
                type: 'post',
                dataType: 'text',
                data: {
                    preId : preId,
                    id : $('#eId').val(),
                    name : $('#eName').val(),
                    pw : $('#ePw').val(),
                    phone : $('#ePhone').val(),
                    grade : $('#eGrade').val(),
                    register : $('#eRegister').val(),
                },
                success: function (data) {
                    if(data != '1'){
                        alert('수정하였습니다.');
                        location.href = '/admin/memManage/';
                    }else{
                        alert('수정실패!!(중복 아이디 있음)');
                    }
                }
            });
        
        }else{
            event.preventDefault();
        }
    });
    
    //강의 정보 수정
    $('#updateSubject').on('click',function(){
        if(confirm('수정하신 내용을 반영하시겠습니까?')==true){
            $.ajax({
                url: '/admin/marketUpdate',
                type: 'post',
                dataType: 'text',
                data: {
                    title : $('#mUTitle').val(),                    
                    name : $('#mUName').val(),
                    contents: $('#mUContents').val(),
                    memo : $('#mUMemo').val(),
                    limit_num : $('#mULimit_num').val(),
                    price : $('#mUPrice').val(),
                    code: mUCode
                },
                success: function (data) {
                    
                        alert('수정하였습니다.');
                        location.href = '/market';
                    
                }
            });
        
        }else{
            event.preventDefault();
        }
    });

    
    
    //index 수 지정과 현재 index 저장 전역변수
    var indexCount = 0;
    var curIndex = 0;
    
    // 슬라이더를 움직여주는 함수
    function moveSlider(index) {
        //슬라이더 이동
        var willMoveLeft = -(index * 600);
        $('.slider_panel').animate({left: willMoveLeft}, 'slow');
        
        curIndex = index;

        //control_button에 activate 클래스를 부여/제거
        $('.control_button[data-index=' + index + ']').addClass('active');
        $('.control_button[data-index!=' + index + ']').removeClass('active');

        //글자 이동
        $('.slider_text[data-index=' + index + ']').show().animate({
            left:0
        }, 'slow');

        $('.slider_text[data-index!=' + index + ']').hide('slow', function(){
            $(this).css('left', -300);
        });
    }

    // 초기 텍스트 위치 지정 및 data-index 할당
    $('.slider_text').css('left', 0).each(function (index) {
        $(this).attr('data-index', index);
        
    });
    
    //using setInterval() to pass slider
    var intervalID = setInterval(function(){
        if(curIndex != indexCount - 1){
            moveSlider(curIndex+1);
        }else
            moveSlider(0);
    }, 10000);
    
    // 컨트롤 버튼의 클릭 핸들러 지정 및 data-index 할당
    $('.control_button').each(function (index) {
        $(this).attr('data-index', index);
        indexCount++;// 몇 개가 들어왔는지 확인
    }).click(function () {
        var index = $(this).attr('data-index');
        moveSlider(index);
    });

    // 초기 슬라이더 위치 지정
    var randomNumber = Math.round(Math.random() * indexCount);
    moveSlider(randomNumber);
});





