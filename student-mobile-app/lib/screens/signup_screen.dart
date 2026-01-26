import 'package:flutter/material.dart';
import '../main.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _studentIdController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _middleNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _courseController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _studentIdController.dispose();
    _firstNameController.dispose();
    _middleNameController.dispose();
    _lastNameController.dispose();
    _courseController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _signup() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Check if student ID already exists
      final existingStudent = await supabase
          .from('students')
          .select()
          .eq('student_id', _studentIdController.text.trim())
          .maybeSingle();

      if (existingStudent != null) {
        throw 'Student ID already exists';
      }

      // Create auth user
      final authResponse = await supabase.auth.signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        emailRedirectTo: null, // Disable email confirmation redirect
        data: {
          'student_id': _studentIdController.text.trim(),
          'fullname': fullName.trim(),
        },
      );

      if (authResponse.user == null) {
        throw 'Failed to create account';
      }

      final fullName = '${_firstNameController.text.trim()} '
          '${_middleNameController.text.trim()} '
          '${_lastNameController.text.trim()}';

      // Create student profile
      await supabase.from('students').insert({
        'id': authResponse.user!.id,
        'student_id': _studentIdController.text.trim(),
        'firstname': _firstNameController.text.trim(),
        'middlename': _middleNameController.text.trim(),
        'lastname': _lastNameController.text.trim(),
        'fullname': fullName.trim(),
        'course': _courseController.text.trim(),
        'status': 'pending',
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Registration successful! Your account is pending approval.',
            ),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );

        await Future.delayed(const Duration(seconds: 2));
        if (mounted) {
          Navigator.of(context).pop();
        }
      }
    } catch (error) {
      setState(() {
        // Handle rate limit error specifically
        if (error.toString().contains('over_email_send_rate_limit')) {
          _errorMessage = 'Email rate limit exceeded. Please wait a few minutes before trying again, or contact an administrator to approve your account manually.';
        } else if (error.toString().contains('User already registered')) {
          _errorMessage = 'This email is already registered. Please try logging in instead.';
        } else {
          _errorMessage = error.toString();
        }
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    String? Function(String?)? validator,
    bool obscureText = false,
    TextInputType? keyboardType,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF374151),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(
              color: Color(0xFF9CA3AF),
            ),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(2),
              borderSide: const BorderSide(
                color: Color(0xFFD1D5DB),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(2),
              borderSide: const BorderSide(
                color: Color(0xFFD1D5DB),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(2),
              borderSide: const BorderSide(
                color: Color(0xFFA78BFA),
                width: 2,
              ),
            ),
          ),
          validator: validator,
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF111827)),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Heading
                    const Text(
                      'Create Account',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF111827),
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Sign up to get started',
                      style: TextStyle(
                        fontSize: 16,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                    
                    const SizedBox(height: 40),
                    
                    // Error message
                    if (_errorMessage != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 24),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          border: Border.all(
                            color: const Color(0xFFFECACA),
                          ),
                        ),
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFFDC2626),
                          ),
                        ),
                      ),
                    
                    // Signup form
                    Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          _buildTextField(
                            controller: _studentIdController,
                            label: 'Student ID:',
                            hint: 'Enter your student ID',
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter your student ID';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          
                          _buildTextField(
                            controller: _firstNameController,
                            label: 'First Name:',
                            hint: 'Enter your first name',
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter your first name';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          
                          _buildTextField(
                            controller: _middleNameController,
                            label: 'Middle Name:',
                            hint: 'Enter your middle name (optional)',
                          ),
                          const SizedBox(height: 20),
                          
                          _buildTextField(
                            controller: _lastNameController,
                            label: 'Last Name:',
                            hint: 'Enter your last name',
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter your last name';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          
                          _buildTextField(
                            controller: _courseController,
                            label: 'Course:',
                            hint: 'Enter your course',
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter your course';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          
                          _buildTextField(
                            controller: _emailController,
                            label: 'Email:',
                            hint: 'Enter your email',
                            keyboardType: TextInputType.emailAddress,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter your email';
                              }
                              if (!value.contains('@')) {
                                return 'Please enter a valid email';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          
                          _buildTextField(
                            controller: _passwordController,
                            label: 'Password:',
                            hint: 'Enter your password',
                            obscureText: true,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter a password';
                              }
                              if (value.length < 6) {
                                return 'Password must be at least 6 characters';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          
                          _buildTextField(
                            controller: _confirmPasswordController,
                            label: 'Confirm Password:',
                            hint: 'Confirm your password',
                            obscureText: true,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please confirm your password';
                              }
                              if (value != _passwordController.text) {
                                return 'Passwords do not match';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 32),
                          
                          // Sign up button
                          SizedBox(
                            width: double.infinity,
                            height: 44,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _signup,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFA78BFA),
                                foregroundColor: Colors.white,
                                disabledBackgroundColor: const Color(0xFFD8B4FE),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(2),
                                ),
                                elevation: 0,
                              ),
                              child: _isLoading
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Text(
                                      'Sign Up',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // Login link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Already have an account? ',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFF6B7280),
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.of(context).pop();
                          },
                          child: const Text(
                            'Login',
                            style: TextStyle(
                              fontSize: 14,
                              color: Color(0xFF8B5CF6),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // Footer note
                    const Text(
                      'Your account will be reviewed by an administrator',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF9CA3AF),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Loading overlay
            if (_isLoading)
              Container(
                color: Colors.black.withOpacity(0.3),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(
                          color: Color(0xFFA78BFA),
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Creating account...',
                          style: TextStyle(
                            color: Color(0xFF374151),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
