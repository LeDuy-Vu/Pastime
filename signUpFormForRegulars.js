$().ready(function() {
    $("#RegularUserSignUp").validate({
        rules: {
            FName: "required",
            LName: "required",
            Pass: {
                required: true,
                minlength: 3
            },
            Email: {
                required:true,
                required:true
            },
            messages: {
                FName: "Please enter your first name",
                LName: "Please enter your last name",
                Pass: {
                    required: "Please provide a password",
                    minlength: "Your password must be at least 3 characters long"
                }
            }

        }
    })
})