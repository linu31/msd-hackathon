import requests
import os
import random
from dotenv import load_dotenv

load_dotenv()

class WorkingAI:
    def __init__(self):
        self.groq_key = os.getenv('GROQ_API_KEY')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.cohere_key = os.getenv('COHERE_API_KEY')
        
        print("🚀 AI Assistant Initialized!")
        print("📡 Testing APIs with updated models...")
        
        # Test with updated models
        self.active_api = self.test_apis()
        
        if self.active_api:
            print(f"✅ Using {self.active_api.upper()} API")
        else:
            print("✅ Using Smart Local AI (No API limits)")
            
    def smart_local_response(self, user_message, user_role, user_data):
        """Smart responses that actually answer questions"""
        name = user_data.get('name', 'friend') if user_data else 'friend'
        message = user_message.lower()
    
    # Direct answers for common questions
        responses = {
        # ... your existing responses ...
        
        # === VIGNAN UNIVERSITY INFORMATION ===
         'vignan university': "🏫 **Vignan University** is a premier educational institution in Andhra Pradesh, India. Known for excellence in engineering, management, and sciences education with state-of-the-art infrastructure and experienced faculty.",
        
         'about vignan': "🎓 **Vignan University** offers UG, PG, and PhD programs across various disciplines including Engineering, Management, Pharmacy, and Sciences. The campus features modern labs, libraries, hostels, and sports facilities.",
        
         'vignan location': "📍 **Vignan University** is located in Vadlamudi, Guntur District, Andhra Pradesh, India. The campus spans over 100 acres with beautiful infrastructure.",
        
         'vignan courses': "📚 **Vignan University Courses**: B.Tech, M.Tech, MBA, BBA, B.Com, B.Pharmacy, M.Pharmacy, Law, and various PhD programs in multiple specializations.",
        
         'vignan departments': "🏛️ **Departments**: CSE, ECE, MECH, EEE, AIML, IT, CIVIL, CHEMICAL, MBA, LAW, BBA, BCOM, PHARMACY, and many more.",
        
        # === FEE PAYMENT WEBSITE INFORMATION ===
         'website features': "🌐 **Website Features**:\n• Online fee payments 24/7\n• Digital receipt generation\n• Payment history tracking\n• Admin dashboard\n• Student management\n• Real-time payment status\n• Secure payment gateway",
        
         'payment methods': "💳 **Accepted Payment Methods**:\n• UPI (Google Pay, PhonePe, etc.)\n• Credit/Debit Cards\n• Net Banking\n• Mobile Wallets\n• All major Indian payment options",
        
         'fee types': "💰 **Fee Types Available**:\n• Tuition Fee: ₹50,000/year\n• Hostel Fee: ₹30,000/year\n• Bus Fee: ₹10,000/year\n• Supply Fee: ₹1,000/attempt\n• Condonation Fee: ₹500\n• Uniform Fee: ₹1,500\n• ID Card Fee: ₹100\n• CRT Fee: ₹5,000",
        
         'installment system': "📅 **Installment Plan**:\n• **First 50%**: Required for exam eligibility (Pay by March 31)\n• **Second 50%**: Complete payment (Pay by September 30)\n• No interest charges\n• Automatic payment reminders",
        
         'exam eligibility criteria': "🎓 **Exam Eligibility**:\n• ✅ Minimum 50% fee payment\n• ✅ Valid college ID card\n• ✅ No pending library dues\n• ✅ 75% minimum attendance\n• ✅ Course registration completed",
        
         'digital receipts': "📄 **Digital Receipts**:\n• Instant generation after payment\n• Download as PDF anytime\n• Email copies automatically\n• 24/7 access in dashboard\n• Valid for all official purposes",
        
         'payment deadlines': "📅 **Academic Year 2024-25**:\n• First Installment: March 31, 2024\n• Second Installment: September 30, 2024\n• Late Fee: ₹500 after deadlines\n• Final Deadline: One week before exams",
        
         'contact support': "📞 **Support Contacts**:\n• Finance Office: 040-23456789\n• Email: finance@vignan.ac.in\n• Office: Block A, Ground Floor\n• Hours: 9 AM - 5 PM (Mon-Sat)\n• IT Support: 040-23456790",
        
         'how to pay online': "🖥️ **Payment Steps**:\n1. Login to student portal\n2. Go to 'Fee Payment' section\n3. Select fee type and amount\n4. Choose payment method\n5. Complete secure payment\n6. Download digital receipt\n7. Check payment history",
        
         'forgot password': "🔐 **Password Recovery**:\n• Click 'Forgot Password' on login page\n• Enter your registered email\n• Check email for reset link\n• Create new password\n• Contact IT support if issues",
        
         'payment failed': "❌ **Payment Issues**:\n• Check internet connection\n• Verify card/UPI details\n• Ensure sufficient balance\n• Wait 15 minutes and retry\n• Contact bank if needed\n• Payment will be refunded if failed",
        
         'receipt download': "📥 **Download Receipt**:\n1. Go to 'Payment History'\n2. Find your transaction\n3. Click 'Download Receipt'\n4. Save PDF file\n5. Print if needed\n• Available 24/7",
        
         'admin features': "👨‍💼 **Admin Dashboard**:\n• View all student payments\n• Generate payment reports\n• Export data to Excel\n• Monitor collections\n• Track pending fees\n• Department-wise analytics",
        
         'student registration': "👤 **New Student Setup**:\n• Visit college admin office\n• Complete registration form\n• Get student credentials\n• Login to payment portal\n• Update profile information",
        
         'hostel facilities': "🏠 **Hostel Information**:\n• AC and non-AC rooms available\n• Food mess with quality meals\n• 24/7 security and WiFi\n• Recreation facilities\n• Laundry services\n• Medical facilities",
        
         'bus routes': "🚌 **Transport Facilities**:\n• College buses on multiple routes\n• Pickup/drop points across city\n• Fixed timings and schedules\n• Safe and comfortable travel\n• Annual bus pass available",
        
         'library dues': "📚 **Library Clearance**:\n• Return all borrowed books\n• Clear any pending fines\n• Get clearance certificate\n• Required for exam eligibility\n• Contact library for details",
        
         'technical support': "🛠️ **Technical Issues**:\n• Clear browser cache\n• Try different browser\n• Check internet connection\n• Contact IT: 040-23456790\n• Email: it-support@vignan.ac.in",
        
         'refund policy': "💸 **Refund Policy**:\n• Fees once paid are generally non-refundable\n• Special cases reviewed by committee\n• Contact finance office for queries\n• Documentation required for review",
        
         'academic calendar': "📅 **Academic Schedule**:\n• Semester begins: July/August\n• Mid exams: October/November\n• Semester exams: December/January\n• Results: Within 45 days\n• Next semester: January/February",
        
         'campus facilities': "🏛️ **Campus Features**:\n• Modern classrooms and labs\n• Central library with digital resources\n• Sports complex and gym\n• Cafeteria and food courts\n• Medical center\n• Bank and ATM facilities",
        
         'placement cell': "💼 **Placement Information**:\n• Dedicated placement cell\n• Top company recruitments\n• Training and workshops\n• Internship opportunities\n• Career guidance\n• Contact placement office",
        
         'scholarship': "🎯 **Scholarship Options**:\n• Merit-based scholarships\n• Government schemes\n• Fee concession for eligible\n• Contact admin office\n• Submit required documents",
        
         'attendance requirement': "📊 **Attendance Policy**:\n• Minimum 75% required\n• Medical leaves considered\n• Parent notification needed\n• Affects exam eligibility\n• Regular attendance important",
        
         # ... your existing responses continue ...
       }
    
    # Exact match
        for key, response in responses.items():
          if message == key:
            return response
    
    # Partial match
        for key, response in responses.items():
          if key in message:
            return response
    
    # Default intelligent response
        default_responses = [
        f"Hey {name}! 😊 I understand you're asking about '{user_message}'. That's interesting! How can I help you with that?",
        f"Hi {name}! 🌟 Thanks for your question! I'd love to help you with '{user_message}'. What specific information are you looking for?",
        f"Hello {name}! 🚀 I see you're curious about '{user_message}'. Tell me more about what you need help with! 😊"
        ]
    
        return random.choice(default_responses)        
    
    def test_apis(self):
        """Test APIs with updated models"""
        # Updated model names
        groq_models = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768']
        openai_models = ['gpt-3.5-turbo']
        cohere_models = ['command', 'command-r']
        
        # Test Groq with updated models
        if self.groq_key:
            for model in groq_models:
                if self.test_groq(model):
                    self.groq_model = model
                    return "groq"
        
        # Test OpenAI
        if self.openai_key:
            for model in openai_models:
                if self.test_openai(model):
                    self.openai_model = model
                    return "openai"
        
        # Test Cohere with updated models
        if self.cohere_key:
            for model in cohere_models:
                if self.test_cohere(model):
                    self.cohere_model = model
                    return "cohere"
        
        return None
    
    def test_groq(self, model):
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.groq_key}"}
            payload = {
                "messages": [{"role": "user", "content": "Say hello"}],
                "model": model,
                "max_tokens": 10
            }
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def test_openai(self, model):
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.openai_key}"}
            payload = {
                "messages": [{"role": "user", "content": "Say hello"}],
                "model": model,
                "max_tokens": 10
            }
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def test_cohere(self, model):
        try:
            url = "https://api.cohere.ai/v1/chat"
            headers = {"Authorization": f"Bearer {self.cohere_key}"}
            payload = {
                "message": "Say hello",
                "model": model
            }
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def query_groq(self, user_message, user_role, user_data):
        """Use Groq API with updated model"""
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.groq_key}",
                "Content-Type": "application/json"
            }
            
            name = user_data.get('name', 'friend') if user_data else 'friend'
            
            payload = {
                "messages": [
                    {
                        "role": "system",
                        "content": f"""You are Vignan AI Assistant. Be conversational and helpful.
User: {name}. Answer naturally and use emojis occasionally."""
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                "model": self.groq_model,
                "temperature": 0.7,
                "max_tokens": 500
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
        except:
            pass
        return None
    
    def query_openai(self, user_message, user_role, user_data):
        """Use OpenAI API"""
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.openai_key}",
                "Content-Type": "application/json"
            }
            
            name = user_data.get('name', 'friend') if user_data else 'friend'
            
            payload = {
                "messages": [
                    {
                        "role": "system",
                        "content": f"You are a helpful AI assistant. User: {name}. Be conversational."
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                "model": self.openai_model,
                "temperature": 0.7,
                "max_tokens": 500
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
        except:
            pass
        return None
    
    def query_cohere(self, user_message, user_role, user_data):
        """Use Cohere API with updated model"""
        try:
            url = "https://api.cohere.ai/v1/chat"
            headers = {
                "Authorization": f"Bearer {self.cohere_key}",
                "Content-Type": "application/json"
            }
            
            name = user_data.get('name', 'friend') if user_data else 'friend'
            
            payload = {
                "message": user_message,
                "model": self.cohere_model,
                "chat_history": [
                    {
                        "role": "system",
                        "message": f"User: {name}. Be helpful and conversational."
                    }
                ],
                "temperature": 0.7
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return data['text']
        except:
            pass
        return None
    
    def generate_response(self, user_message, user_role="student", user_data=None):
        # Try active API first
        if self.active_api == "groq":
            response = self.query_groq(user_message, user_role, user_data)
            if response:
                return response
        
        elif self.active_api == "openai":
            response = self.query_openai(user_message, user_role, user_data)
            if response:
                return response
        
        elif self.active_api == "cohere":
            response = self.query_cohere(user_message, user_role, user_data)
            if response:
                return response
        
        # Smart local responses as fallback
        return self.smart_local_response(user_message, user_role, user_data)
    
    
    def smart_local_response(self, user_message, user_role, user_data):
        """Smart responses that actually answer questions"""
        name = user_data.get('name', 'friend') if user_data else 'friend'
        message = user_message.lower()
        
        # Direct answers for common questions
        responses = {
            'hi': f"Hey {name}! 👋 What's up? How can I help you today?",
            'hello': f"Hello {name}! 😊 Good to see you! What's on your mind?",
            'hey': f"Hey there {name}! 🎉 How's it going?",
            'how are you': f"I'm doing great, {name}! 😄 Thanks for asking! How about you?",
            'how are u': f"I'm awesome, {name}! 🌟 How are you doing today?",
            'i love you': f"Aww, that's sweet {name}! 😊 I'm here to help you with anything!",
            'love you': f"Thanks {name}! 😄 You're awesome too!",
            'fuck you': f"I'm here to help you, {name}. 😊 What can I assist you with today?",
            'which ai api u are': "I'm Vignan AI Assistant! 🤖 Using the latest AI models to help you!",
            'what api you use': "I use multiple AI services including Groq and OpenAI! 🚀",
            'have you eat': f"I don't eat food, {name}! 😄 But I'm always here and ready to help you!",
            'did you eat': f"I don't need to eat, {name}! 😊 But I'm always here for you!",
            'your name': "I'm Vignan AI Assistant! 🤖 Your friendly helper!",
            'who are you': "I'm Vignan AI! 🌟 Created to help students and staff with university matters!",
            'thank you': f"You're welcome, {name}! 😊 Always happy to help!",
            'thanks': f"Anytime, {name}! 😄 What else can I help with?",
            'bye': f"Goodbye {name}! 👋 Take care and see you soon!",
            'goodbye': f"See you later, {name}! 🌟 Have a great day!",
            'debug': "🔍 I'm using updated AI models to ensure everything works perfectly!",
            'test': "🧪 Everything is working! I can answer your questions now!",
            'what is this website': "🌐 This is Vignan University's Online Fee Payment System! Pay fees, get receipts, and more!",
            'how to pay fees': f"💰 To pay fees: Login → Fee Payment → Select type → Pay → Get receipt! Easy, {name}!",
            'exam eligibility': "🎓 Need 50% fees paid + valid ID + no dues + good attendance!",
        }
        
        # Exact match
        for key, response in responses.items():
            if message == key:
                return response
        
        # Partial match
        for key, response in responses.items():
            if key in message:
                return response
        
        # Default intelligent response
        default_responses = [
            f"Hey {name}! 😊 I understand you're asking about '{user_message}'. That's interesting! How can I help you with that?",
            f"Hi {name}! 🌟 Thanks for your question! I'd love to help you with '{user_message}'. What specific information are you looking for?",
            f"Hello {name}! 🚀 I see you're curious about '{user_message}'. Tell me more about what you need help with! 😊"
        ]
        
        return random.choice(default_responses)

# Create instance
gemini_ai = WorkingAI()