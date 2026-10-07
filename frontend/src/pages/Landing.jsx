import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaChartLine, 
  FaShieldAlt, 
  FaClock,
  FaStethoscope,
  FaVirus,
  FaArrowRight,
  FaBrain,
  FaMicroscope
} from 'react-icons/fa';

const Landing = () => {
  const features = [
    {
      icon: <FaBrain className="text-4xl" />,
      title: "AI-Powered Diagnosis",
      description: "Advanced deep learning algorithms to accurately detect poultry diseases from droppings images"
    },
    {
      icon: <FaClock className="text-4xl" />,
      title: "Instant Results",
      description: "Get disease predictions in seconds with detailed treatment recommendations"
    },
    {
      icon: <FaChartLine className="text-4xl" />,
      title: "Track Progress",
      description: "Monitor your flock's health with comprehensive analytics and history tracking"
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Secure & Private",
      description: "Your data is encrypted and protected with industry-standard security measures"
    }
  ];

  const stats = [
    { value: "95%+", label: "Accuracy Rate" },
    { value: "10k+", label: "Analyses Done" },
    { value: "500+", label: "Happy Farmers" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-indigo-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-xl">🐔</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                PoultryAI
              </span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link
                to="/signin"
                className="px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transform hover:scale-105"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                <FaMicroscope className="text-indigo-600" />
                <span>AI-Powered Disease Detection</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Protect Your Flock with
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {" "}Smart
                </span>
                <br />Disease Detection
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Upload a photo of your poultry's droppings and get instant, accurate disease diagnosis with detailed treatment recommendations. 
                Keep your birds healthy with cutting-edge artificial intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl hover:shadow-2xl hover:shadow-indigo-500/25 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <FaArrowRight />
                </Link>
                <Link
                  to="/signin"
                  className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl border-2 border-indigo-200 flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-indigo-600" />
                  <span>Always free to use</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-indigo-600" />
                  <span>No credit card ever</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-100 to-violet-100 p-8">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
                <div className="relative z-10 h-full flex flex-col justify-center items-center space-y-6">
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                    <FaVirus className="text-7xl text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Smart Analysis</h3>
                    <p className="text-gray-600">Upload → Analyze → Diagnose</p>
                  </div>
                </div>
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-8 right-8 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center"
                >
                  <span className="text-4xl">🐔</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-8 left-8 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center"
                >
                  <span className="text-4xl">💊</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                  className="absolute top-1/2 left-4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl shadow-lg flex items-center justify-center"
                >
                  <FaStethoscope className="text-2xl text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose PoultryAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of poultry disease management with our advanced AI platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all transform hover:-translate-y-2 border border-indigo-100"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/25">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload Photo", desc: "Take or upload a clear photo of poultry droppings", icon: "📸" },
              { step: "02", title: "AI Analysis", desc: "Our AI analyzes the image for disease indicators", icon: "🤖" },
              { step: "03", title: "Get Results", desc: "Receive diagnosis and treatment recommendations", icon: "📋" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-300 to-violet-300 -translate-x-0 translate-y-8"></div>
                )}
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-500/25">
                  {item.icon}
                </div>
                <div className="w-10 h-10 mx-auto mb-4 -mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Protect Your Flock?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of farmers who trust PoultryAI for their disease detection needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Your Free Trial</span>
                <FaArrowRight />
              </Link>
              <Link
                to="/signin"
                className="px-8 py-4 bg-transparent text-white rounded-full font-semibold hover:bg-white/10 transition-all border-2 border-white flex items-center justify-center"
              >
                Sign In to Continue
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <span className="text-xl">🐔</span>
                </div>
                <span className="text-xl font-bold">PoultryAI</span>
              </div>
              <p className="text-gray-400">
                AI-powered poultry disease detection for healthier flocks.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/signup" className="hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link to="/signup" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                <li><Link to="/signup" className="hover:text-indigo-400 transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PoultryAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
