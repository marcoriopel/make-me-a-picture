package com.example.prototype_mobile.view.connection.sign_up

class SignUpFormState(val firstNameError: Int? = null,
                      val lastNameError: Int? = null,
                      val usernameError: Int? = null,
                      val passwordError: Int ? = null,
                      val passwordConfirmationError: Int? = null,
                      val isDataValid: Boolean = false)
