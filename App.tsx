import React, { useState } from 'react';
import { 
  Leaf, 
  Utensils, 
  Trash2, 
  Award, 
  Heart, 
  LogOut, 
  ChefHat, 
  BarChart3, 
  CheckCircle,
  Globe,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ReTooltip,
  Legend
} from 'recharts';
import { User, Language, View, Recipe, QuizQuestion } from './types';
import { TRANSLATIONS, TIPS } from './constants';
import { generateLeftoverRecipe, generateQuizQuestion } from './services/geminiService';

// --- Components ---

const Button: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-2xl font-bold transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-pastel-green text-white hover:bg-pastel-darkGreen",
    secondary: "bg-pastel-yellow text-pastel-darkGreen hover:bg-yellow-300",
    danger: "bg-pastel-pink text-red-800 hover:bg-red-300",
    outline: "border-2 border-pastel-green text-pastel-darkGreen hover:bg-pastel-green hover:text-white"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ children, title, className = '' }) => (
  <div className={`bg-white rounded-3xl p-6 shadow-xl border-2 border-pastel-green/20 ${className}`}>
    {title && <h2 className="text-2xl font-bold text-pastel-darkGreen mb-4">{title}</h2>}
    {children}
  </div>
);

// Custom Cute Logo Component
const EcoBiteLogo = () => (
  <div className="flex justify-center mb-6">
    <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg hover:scale-105 transition-transform duration-500">
      {/* Background Circle */}
      <circle cx="100" cy="100" r="90" fill="#FEF9E7" stroke="#A7D7C5" strokeWidth="4"/>
      
      {/* The Apple/Planet Character */}
      <path d="M100 160C135.899 160 165 130.899 165 95C165 59.1015 135.899 30 100 30C64.1015 30 35 59.1015 35 95C35 130.899 64.1015 160 100 160Z" fill="#A7D7C5"/>
      <path d="M100 160C100 160 85 140 85 95C85 50 100 30 100 30" stroke="#5C8D75" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
      
      {/* Bite Mark */}
      <circle cx="160" cy="80" r="20" fill="#FEF9E7"/>
      
      {/* Leaf */}
      <path d="M100 30C100 30 95 10 115 10C135 10 120 30 100 30Z" fill="#8FC1A9" stroke="#5C8D75" strokeWidth="2"/>
      
      {/* Cute Face */}
      <circle cx="80" cy="100" r="6" fill="#2D3748"/>
      <circle cx="120" cy="100" r="6" fill="#2D3748"/>
      <path d="M90 115C90 115 95 120 100 120C105 120 110 115 110 115" stroke="#2D3748" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Cheeks */}
      <circle cx="70" cy="108" r="5" fill="#F4C2C2" opacity="0.8"/>
      <circle cx="130" cy="108" r="5" fill="#F4C2C2" opacity="0.8"/>
      
      {/* Sparkles */}
      <path d="M40 60L45 55L50 60L45 65L40 60Z" fill="#FAE588"/>
      <path d="M160 140L165 135L170 140L165 145L160 140Z" fill="#F4C2C2"/>
    </svg>
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('id'); 
  const [view, setView] = useState<View>(View.LOGIN);
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [usernameInput, setUsernameInput] = useState('');

  // Recipe State
  const [ingredients, setIngredients] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  // Quiz State
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Waste Calculator State
  const [wasteInputs, setWasteInputs] = useState({ bread: 0, fruit: 0, dairy: 0, meat: 0 });
  const [calculatedImpact, setCalculatedImpact] = useState<{ money: number, co2: number } | null>(null);

  // Commitment State
  const [newCommitment, setNewCommitment] = useState('');

  const t = TRANSLATIONS[lang];

  // --- Handlers ---

  const handleLogin = () => {
    if (usernameInput.trim()) {
      setUser({
        username: usernameInput,
        points: 50,
        streak: 3,
        commitments: []
      });
      setView(View.DASHBOARD);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setGeneratedRecipe(null);
    const recipe = await generateLeftoverRecipe(ingredients, lang);
    setGeneratedRecipe(recipe);
    setLoading(false);
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    setQuizFeedback(null);
    const question = await generateQuizQuestion(lang);
    setQuizQuestion(question);
    setLoading(false);
  };

  const handleAnswerQuiz = (index: number) => {
    if (!quizQuestion) return;
    if (index === quizQuestion.correctIndex) {
      setQuizFeedback('correct');
      setUser(prev => prev ? { ...prev, points: prev.points + 20 } : null);
    } else {
      setQuizFeedback('incorrect');
    }
  };

  const handleCalculateWaste = () => {
    // Estimation logic: 
    // Bread: ~2000 IDR/100g, 0.06kg CO2
    // Fruit: ~3000 IDR/100g, 0.04kg CO2
    // Dairy: ~5000 IDR/100g, 0.20kg CO2
    // Meat: ~12000 IDR/100g, 1.50kg CO2
    
    const cost = 
      (wasteInputs.bread * 2000) + 
      (wasteInputs.fruit * 3000) + 
      (wasteInputs.dairy * 5000) + 
      (wasteInputs.meat * 12000);

    const co2 = 
      (wasteInputs.bread * 0.06) + 
      (wasteInputs.fruit * 0.04) + 
      (wasteInputs.dairy * 0.20) + 
      (wasteInputs.meat * 1.50);

    setCalculatedImpact({ money: cost, co2: parseFloat(co2.toFixed(2)) });
  };

  const handleAddCommitment = () => {
    if (newCommitment.trim() && user) {
      setUser({
        ...user,
        commitments: [...user.commitments, newCommitment]
      });
      setNewCommitment('');
      // Award points for commitment
      setUser(prev => prev ? { ...prev, points: prev.points + 10 } : null);
    }
  };

  // --- Renderers ---

  const renderLogin = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-pastel-cream text-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-4 border-white">
        <EcoBiteLogo />
        
        <h1 className="text-5xl font-extrabold text-pastel-darkGreen mb-2 tracking-tight">Eco-Bite</h1>
        <p className="text-xl text-pastel-brown font-semibold mb-8 italic">"Kurangi, Olah, Habiskan"</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-left text-pastel-darkGreen font-bold mb-2 ml-1 text-sm uppercase tracking-wide">
              {lang === 'en' ? 'Who are you?' : 'Siapa namamu?'}
            </label>
            <input 
              type="text" 
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder={t.username}
              className="w-full p-4 rounded-2xl border-2 border-pastel-green focus:border-pastel-darkGreen focus:ring-4 focus:ring-pastel-green/20 outline-none transition-all text-black placeholder-gray-400 font-bold text-lg bg-white"
            />
          </div>

          <Button onClick={handleLogin} className="w-full text-lg shadow-lg shadow-pastel-green/30">
            {t.loginBtn}
          </Button>

          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={() => setLang('id')} 
              className={`px-4 py-2 rounded-xl font-bold transition-all ${lang === 'id' ? 'bg-pastel-brown text-white shadow-md' : 'bg-transparent text-pastel-brown hover:bg-pastel-brown/10'}`}
            >
              🇮🇩 ID
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={`px-4 py-2 rounded-xl font-bold transition-all ${lang === 'en' ? 'bg-pastel-brown text-white shadow-md' : 'bg-transparent text-pastel-brown hover:bg-pastel-brown/10'}`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2 bg-pastel-green rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">{t.welcome}, {user?.username}!</h1>
          <p className="opacity-90 text-lg mb-6">{t.subtitle}</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-300" />
              <div>
                <p className="text-xs uppercase font-bold tracking-wider opacity-80">{t.points}</p>
                <p className="text-2xl font-black">{user?.points}</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-pastel-pink" />
              <div>
                <p className="text-xs uppercase font-bold tracking-wider opacity-80">{t.streak}</p>
                <p className="text-2xl font-black">{user?.streak} Days</p>
              </div>
            </div>
          </div>
        </div>
        <Leaf className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-10 rotate-12" />
      </div>

      <div className="md:col-span-2">
         <Card className="bg-white border-none shadow-md">
           <h3 className="font-bold text-pastel-darkGreen flex items-center gap-2 mb-2">
             <Heart className="w-5 h-5 text-pastel-pink fill-current" />
             Daily Tip
           </h3>
           <p className="text-gray-600 italic">"{TIPS[lang][Math.floor(Math.random() * TIPS[lang].length)]}"</p>
         </Card>
      </div>

      <Button onClick={() => setView(View.CALCULATOR)} variant="secondary" className="h-32 flex flex-col gap-2 text-xl border-2 border-transparent hover:border-pastel-yellow">
        <Trash2 className="w-10 h-10" />
        {t.calculator}
      </Button>

      <Button onClick={() => setView(View.RECIPES)} variant="secondary" className="h-32 flex flex-col gap-2 text-xl border-2 border-transparent hover:border-pastel-yellow">
        <ChefHat className="w-10 h-10" />
        {t.recipes}
      </Button>

      <Button onClick={() => setView(View.QUIZ)} variant="secondary" className="h-32 flex flex-col gap-2 text-xl border-2 border-transparent hover:border-pastel-yellow">
        <LogOut className="w-10 h-10 rotate-180" /> 
        {/* Using LogOut rotated as a playful icon, or use a QuestionMark if available */}
        {t.quiz}
      </Button>

      <Button onClick={() => setView(View.COMMITMENT)} variant="secondary" className="h-32 flex flex-col gap-2 text-xl border-2 border-transparent hover:border-pastel-yellow">
        <CheckCircle className="w-10 h-10" />
        {t.commitment}
      </Button>
    </div>
  );

  const renderCalculator = () => (
    <div className="space-y-6">
      <Card title={t.wasteTitle}>
        <p className="text-gray-600 mb-6">{t.wasteDesc}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {Object.entries(t.categories).map(([key, label]) => (
            <div key={key} className="bg-pastel-cream p-4 rounded-2xl">
              <label className="block font-bold text-pastel-darkGreen mb-2 text-sm">{label} (100g units)</label>
              <input 
                type="number" 
                min="0"
                className="w-full p-2 rounded-xl border-2 border-pastel-green focus:outline-none focus:ring-2 focus:ring-pastel-green text-center text-xl font-bold text-gray-700 bg-white"
                value={wasteInputs[key as keyof typeof wasteInputs]}
                onChange={(e) => setWasteInputs({...wasteInputs, [key]: parseInt(e.target.value) || 0})}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleCalculateWaste} className="w-full mb-6">
          <BarChart3 className="w-5 h-5" />
          {t.calculate}
        </Button>

        {calculatedImpact && (
          <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 animate-fade-in">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-red-400 text-xs font-bold uppercase tracking-wide">{t.moneyLost}</p>
                <p className="text-2xl font-black text-red-600">Rp {calculatedImpact.money.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">{t.co2Emitted}</p>
                <p className="text-2xl font-black text-gray-600">{calculatedImpact.co2} kg</p>
              </div>
            </div>
            
            <div className="h-48 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Food', value: 100 }, // Placeholder for visual
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#A7D7C5"
                    dataKey="value"
                  >
                    <Cell fill="#F4C2C2" />
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-gray-400 mt-[-110px] font-bold">Total Waste</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const renderRecipes = () => (
    <div className="space-y-6">
      <Card title={t.recipeTitle}>
        <p className="text-gray-600 mb-6">{t.recipeDesc}</p>
        <div className="relative">
          <textarea 
            className="w-full p-4 rounded-2xl border-2 border-pastel-green focus:outline-none focus:ring-2 focus:ring-pastel-green min-h-[120px] text-gray-700 placeholder-gray-400 resize-none bg-pastel-cream/30"
            placeholder={t.ingredientsPlaceholder}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <Utensils className="absolute bottom-4 right-4 text-pastel-green opacity-50" />
        </div>
        <Button 
          onClick={handleGenerateRecipe} 
          disabled={loading || !ingredients} 
          className="w-full mt-4"
        >
          {loading ? (
            <span className="flex items-center gap-2 animate-pulse">{t.loading}</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t.findRecipe}
            </>
          )}
        </Button>
      </Card>

      {generatedRecipe && (
        <Card className="animate-fade-in border-pastel-pink/30 bg-white">
          <div className="text-center mb-6">
            <span className="text-6xl mb-2 block animate-bounce-slow">{generatedRecipe.emoji}</span>
            <h3 className="text-2xl font-bold text-pastel-darkGreen">{generatedRecipe.title}</h3>
          </div>
          
          <div className="bg-pastel-cream rounded-2xl p-4 mb-4">
            <h4 className="font-bold text-pastel-brown mb-2 uppercase text-xs tracking-wider">Ingredients</h4>
            <ul className="space-y-1">
              {generatedRecipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="w-1.5 h-1.5 bg-pastel-green rounded-full mt-1.5 shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-pastel-brown mb-2 uppercase text-xs tracking-wider">Instructions</h4>
            <div className="space-y-3">
              {generatedRecipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3 text-gray-700 text-sm">
                  <span className="font-bold text-pastel-green shrink-0">{i + 1}.</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderQuiz = () => (
    <div className="h-full flex flex-col justify-center">
      <Card title={t.quizTitle} className="text-center min-h-[400px] flex flex-col justify-center items-center">
        {!quizQuestion ? (
          <>
            <div className="bg-pastel-cream w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-16 h-16 text-pastel-green" />
            </div>
            <p className="text-gray-600 mb-8 max-w-xs mx-auto">{t.quizDesc}</p>
            <Button onClick={handleStartQuiz} disabled={loading} className="w-full max-w-xs mx-auto">
              {loading ? t.loading : "Start Quiz"}
            </Button>
          </>
        ) : (
          <div className="w-full animate-fade-in">
            <h3 className="text-xl font-bold text-black mb-8 leading-snug">{quizQuestion.question}</h3>
            <div className="grid gap-3 mb-6">
              {quizQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerQuiz(i)}
                  disabled={!!quizFeedback}
                  className={`p-4 rounded-xl font-bold text-left transition-all border-2 ${
                    quizFeedback 
                      ? i === quizQuestion.correctIndex 
                        ? 'bg-green-100 border-green-400 text-green-800'
                        : i === (quizFeedback === 'incorrect' ? -1 : -1) // Logic placeholder
                          ? 'bg-red-100 border-red-400 text-red-800'
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                      : 'bg-white border-pastel-green text-black hover:bg-pastel-cream hover:border-pastel-darkGreen'
                  }`}
                >
                  <span className="mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>

            {quizFeedback && (
              <div className={`p-4 rounded-xl mb-6 ${quizFeedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="font-bold mb-1 text-black">
                  {quizFeedback === 'correct' ? '🎉 Awesome!' : '😢 Oops!'}
                </p>
                <p className="text-sm text-black">{quizQuestion.explanation}</p>
              </div>
            )}

            {quizFeedback && (
              <Button onClick={handleStartQuiz} className="w-full">
                {t.nextQuestion}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );

  const renderCommitment = () => (
    <div className="space-y-6">
      <Card title={t.pledgeTitle}>
        <div className="flex gap-2 mb-8">
          <input 
            type="text" 
            value={newCommitment}
            onChange={(e) => setNewCommitment(e.target.value)}
            placeholder={t.pledgePlaceholder}
            className="flex-1 p-3 rounded-xl border-2 border-pastel-green focus:outline-none focus:ring-2 focus:ring-pastel-green bg-white text-black"
          />
          <Button onClick={handleAddCommitment} className="px-4">
            <CheckCircle className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {user?.commitments.length === 0 && (
            <p className="text-center text-gray-400 italic py-8">No pledges yet. Start today!</p>
          )}
          {user?.commitments.map((c, i) => (
            <div key={i} className="bg-pastel-cream p-4 rounded-xl flex items-center gap-3 animate-slide-in">
              <div className="w-8 h-8 bg-pastel-green rounded-full flex items-center justify-center text-white shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="font-bold text-pastel-darkGreen">{c}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  if (view === View.LOGIN) {
    return renderLogin();
  }

  return (
    <div className="min-h-screen bg-pastel-cream/50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(View.DASHBOARD)}>
           {/* Mini Logo for Header */}
           <div className="w-8 h-8 rounded-full bg-pastel-green flex items-center justify-center text-white font-bold text-xs">EB</div>
           <span className="font-bold text-pastel-darkGreen">Eco-Bite</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-pastel-yellow px-3 py-1 rounded-full text-xs font-bold text-pastel-brown flex items-center gap-1">
             <Award className="w-3 h-3" />
             {user?.points}
           </div>
           <Button variant="danger" className="px-3 py-1 text-xs h-8" onClick={() => setView(View.LOGIN)}>
             <LogOut className="w-3 h-3" />
           </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 pt-6">
        {view === View.DASHBOARD && renderDashboard()}
        {view === View.CALCULATOR && renderCalculator()}
        {view === View.RECIPES && renderRecipes()}
        {view === View.QUIZ && renderQuiz()}
        {view === View.COMMITMENT && renderCommitment()}
      </div>

      {/* Bottom Nav (Mobile style) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2 flex justify-around items-center z-50 md:hidden">
        <button onClick={() => setView(View.DASHBOARD)} className={`p-2 rounded-xl transition-all ${view === View.DASHBOARD ? 'text-pastel-darkGreen bg-pastel-green/20' : 'text-gray-300'}`}>
          <BarChart3 className="w-6 h-6" />
        </button>
        <button onClick={() => setView(View.CALCULATOR)} className={`p-2 rounded-xl transition-all ${view === View.CALCULATOR ? 'text-pastel-darkGreen bg-pastel-green/20' : 'text-gray-300'}`}>
          <Trash2 className="w-6 h-6" />
        </button>
        <div className="relative -top-6">
          <button 
            onClick={() => setView(View.RECIPES)} 
            className="w-14 h-14 bg-pastel-green text-white rounded-full shadow-lg shadow-pastel-green/40 flex items-center justify-center transform active:scale-95 transition-all"
          >
            <ChefHat className="w-7 h-7" />
          </button>
        </div>
        <button onClick={() => setView(View.QUIZ)} className={`p-2 rounded-xl transition-all ${view === View.QUIZ ? 'text-pastel-darkGreen bg-pastel-green/20' : 'text-gray-300'}`}>
          <LogOut className="w-6 h-6 rotate-180" />
        </button>
        <button onClick={() => setView(View.COMMITMENT)} className={`p-2 rounded-xl transition-all ${view === View.COMMITMENT ? 'text-pastel-darkGreen bg-pastel-green/20' : 'text-gray-300'}`}>
          <CheckCircle className="w-6 h-6" />
        </button>
      </div>
      
      {/* Desktop Helper Nav - hidden on mobile */}
      <div className="hidden md:flex fixed left-0 top-20 bottom-0 w-20 flex-col items-center py-8 gap-8 bg-white shadow-xl z-40 rounded-r-3xl">
        <button onClick={() => setView(View.DASHBOARD)} className={`p-3 rounded-2xl transition-all ${view === View.DASHBOARD ? 'text-pastel-green bg-pastel-green/10 shadow-inner' : 'text-gray-300 hover:bg-gray-50'}`}>
          <BarChart3 className="w-6 h-6" />
        </button>
        <button onClick={() => setView(View.CALCULATOR)} className={`p-3 rounded-2xl transition-all ${view === View.CALCULATOR ? 'text-pastel-green bg-pastel-green/10 shadow-inner' : 'text-gray-300 hover:bg-gray-50'}`}>
          <Trash2 className="w-6 h-6" />
        </button>
        <button onClick={() => setView(View.RECIPES)} className={`p-3 rounded-2xl transition-all ${view === View.RECIPES ? 'text-pastel-green bg-pastel-green/10 shadow-inner' : 'text-gray-300 hover:bg-gray-50'}`}>
          <ChefHat className="w-6 h-6" />
        </button>
        <button onClick={() => setView(View.QUIZ)} className={`p-3 rounded-2xl transition-all ${view === View.QUIZ ? 'text-pastel-green bg-pastel-green/10 shadow-inner' : 'text-gray-300 hover:bg-gray-50'}`}>
          <LogOut className="w-6 h-6 rotate-180" />
        </button>
        <button onClick={() => setView(View.COMMITMENT)} className={`p-3 rounded-2xl transition-all ${view === View.COMMITMENT ? 'text-pastel-green bg-pastel-green/10 shadow-inner' : 'text-gray-300 hover:bg-gray-50'}`}>
          <CheckCircle className="w-6 h-6" />
        </button>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}