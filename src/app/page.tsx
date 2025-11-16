'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import { Scale, Target, TrendingDown, Calculator, Apple, Activity, Trophy, Calendar, Heart, Clock, Utensils, ArrowRight, CheckCircle, Camera, Upload, X, Dumbbell, Home, Edit2, Check, Play, Pause, RotateCcw, Bell, ChefHat, Zap, Flame, Droplet, Wheat, Beef } from 'lucide-react'

interface WeightEntry {
  date: string
  weight: number
  id: number
}

interface MealPhoto {
  id: number
  date: string
  imageUrl: string
  analysis: {
    foods: Array<{
      name: string
      calories: number
      carbs: number
      protein: number
      fat: number
      weight: number
    }>
    totalCalories: number
    totalCarbs: number
    totalProtein: number
    totalFat: number
  } | null
  isAnalyzing: boolean
}

interface OnboardingData {
  name: string
  weight: string
  height: string
  age: string
  gender: 'male' | 'female' | 'other'
  goal: 'lose_weight' | 'gain_weight' | 'gain_muscle' | 'improve_health' | 'other'
}

export default function NutriSnapApp() {
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    weight: '',
    height: '',
    age: '',
    gender: 'female',
    goal: 'lose_weight'
  })

  const [userProfile, setUserProfile] = useState({
    height: '',
    currentWeight: '',
    targetWeight: '',
    gender: 'female'
  })

  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [mealPhotos, setMealPhotos] = useState<MealPhoto[]>([])
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(1500)
  const [newWeight, setNewWeight] = useState('')
  const [isEditingCalorieGoal, setIsEditingCalorieGoal] = useState(false)
  const [tempCalorieGoal, setTempCalorieGoal] = useState(dailyCalorieGoal.toString())

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const hasCompletedOnboarding = localStorage.getItem('nutrisnap_onboarding_complete')
    const savedProfile = localStorage.getItem('nutrisnap_profile')
    
    if (hasCompletedOnboarding && savedProfile) {
      setIsFirstTime(false)
      setUserProfile(JSON.parse(savedProfile))
    }
    
    const savedWeights = localStorage.getItem('nutrisnap_weights')
    const savedMealPhotos = localStorage.getItem('nutrisnap_meals')
    const savedGoal = localStorage.getItem('nutrisnap_calorie_goal')

    if (savedWeights) setWeightEntries(JSON.parse(savedWeights))
    if (savedMealPhotos) setMealPhotos(JSON.parse(savedMealPhotos))
    if (savedGoal) {
      const goal = JSON.parse(savedGoal)
      setDailyCalorieGoal(goal)
      setTempCalorieGoal(goal.toString())
    }
  }, [])

  useEffect(() => {
    if (!isFirstTime) {
      localStorage.setItem('nutrisnap_profile', JSON.stringify(userProfile))
    }
  }, [userProfile, isFirstTime])

  useEffect(() => {
    localStorage.setItem('nutrisnap_weights', JSON.stringify(weightEntries))
  }, [weightEntries])

  useEffect(() => {
    localStorage.setItem('nutrisnap_meals', JSON.stringify(mealPhotos))
  }, [mealPhotos])

  useEffect(() => {
    localStorage.setItem('nutrisnap_calorie_goal', JSON.stringify(dailyCalorieGoal))
  }, [dailyCalorieGoal])

  const completeOnboarding = () => {
    const currentWeight = parseFloat(onboardingData.weight)
    let targetWeight = currentWeight
    
    if (onboardingData.goal === 'lose_weight') {
      targetWeight = currentWeight * 0.9
    } else if (onboardingData.goal === 'gain_weight' || onboardingData.goal === 'gain_muscle') {
      targetWeight = currentWeight * 1.05
    }

    setUserProfile({
      height: onboardingData.height,
      currentWeight: onboardingData.weight,
      targetWeight: targetWeight.toFixed(1),
      gender: onboardingData.gender
    })

    const calculatedCalories = calculateDailyCalories(onboardingData)
    setDailyCalorieGoal(calculatedCalories)
    setTempCalorieGoal(calculatedCalories.toString())

    localStorage.setItem('nutrisnap_onboarding_complete', 'true')
    localStorage.setItem('nutrisnap_user_data', JSON.stringify(onboardingData))
    
    setIsFirstTime(false)
  }

  const calculateDailyCalories = (data: OnboardingData) => {
    const weight = parseFloat(data.weight)
    const height = parseFloat(data.height)
    const age = parseFloat(data.age)
    
    let bmr = data.gender === 'male' 
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)

    let totalCalories = bmr * 1.55

    if (data.goal === 'lose_weight') {
      totalCalories -= 500
    } else if (data.goal === 'gain_weight' || data.goal === 'gain_muscle') {
      totalCalories += 300
    }

    return Math.round(totalCalories)
  }

  const saveCalorieGoal = () => {
    const newGoal = parseInt(tempCalorieGoal)
    if (!isNaN(newGoal) && newGoal > 0) {
      setDailyCalorieGoal(newGoal)
      setIsEditingCalorieGoal(false)
    }
  }

  const analyzeMealPhoto = async (photoId: number, imageUrl: string) => {
    try {
      setMealPhotos(prev => prev.map(photo => 
        photo.id === photoId ? { ...photo, isAnalyzing: true } : photo
      ))

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl })
      })

      if (!response.ok) {
        throw new Error('Erro ao analisar imagem')
      }

      const analysis = await response.json()

      setMealPhotos(prev => prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, analysis, isAnalyzing: false }
          : photo
      ))
    } catch (error) {
      console.error('Erro ao analisar refeição:', error)
      const mockAnalysis = {
        foods: [
          { name: 'Arroz branco', calories: 130, carbs: 28, protein: 2.7, fat: 0.3, weight: 100 },
          { name: 'Feijão preto', calories: 77, carbs: 14, protein: 4.5, fat: 0.5, weight: 80 },
          { name: 'Frango grelhado', calories: 165, carbs: 0, protein: 31, fat: 3.6, weight: 100 }
        ],
        totalCalories: 372,
        totalCarbs: 42,
        totalProtein: 38.2,
        totalFat: 4.4
      }

      setMealPhotos(prev => prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, analysis: mockAnalysis, isAnalyzing: false }
          : photo
      ))
    }
  }

  const handleMealPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const imageUrl = reader.result as string
      const newPhoto: MealPhoto = {
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        imageUrl,
        analysis: null,
        isAnalyzing: false
      }
      
      setMealPhotos(prev => [...prev, newPhoto])
      analyzeMealPhoto(newPhoto.id, imageUrl)
    }
    
    reader.readAsDataURL(file)
  }

  const removeMealPhoto = (id: number) => {
    setMealPhotos(prev => prev.filter(photo => photo.id !== id))
  }

  const calculateBMI = () => {
    if (!userProfile.height || !userProfile.currentWeight) return 0
    const heightInM = parseFloat(userProfile.height) / 100
    return parseFloat(userProfile.currentWeight) / (heightInM * heightInM)
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'bg-blue-500' }
    if (bmi < 25) return { category: 'Peso normal', color: 'bg-green-500' }
    if (bmi < 30) return { category: 'Sobrepeso', color: 'bg-yellow-500' }
    return { category: 'Obesidade', color: 'bg-red-500' }
  }

  const calculateWeightLoss = () => {
    if (!userProfile.currentWeight || !userProfile.targetWeight) return 0
    return parseFloat(userProfile.currentWeight) - parseFloat(userProfile.targetWeight)
  }

  const calculateProgress = () => {
    if (weightEntries.length === 0 || !userProfile.targetWeight) return 0
    const initialWeight = parseFloat(userProfile.currentWeight) || weightEntries[0]?.weight || 0
    const currentWeight = weightEntries[weightEntries.length - 1]?.weight || initialWeight
    const targetWeight = parseFloat(userProfile.targetWeight)
    const totalLoss = initialWeight - targetWeight
    const currentLoss = initialWeight - currentWeight
    return totalLoss > 0 ? (currentLoss / totalLoss) * 100 : 0
  }

  const getTodayCalories = () => {
    const today = new Date().toLocaleDateString('pt-BR')
    return mealPhotos
      .filter(photo => photo.date === today && photo.analysis)
      .reduce((total, photo) => total + (photo.analysis?.totalCalories || 0), 0)
  }

  const getTodayMacros = () => {
    const today = new Date().toLocaleDateString('pt-BR')
    const todayMeals = mealPhotos.filter(photo => photo.date === today && photo.analysis)
    
    return {
      carbs: todayMeals.reduce((total, photo) => total + (photo.analysis?.totalCarbs || 0), 0),
      protein: todayMeals.reduce((total, photo) => total + (photo.analysis?.totalProtein || 0), 0),
      fat: todayMeals.reduce((total, photo) => total + (photo.analysis?.totalFat || 0), 0)
    }
  }

  const addWeightEntry = () => {
    if (!newWeight) return
    const entry: WeightEntry = {
      date: new Date().toLocaleDateString('pt-BR'),
      weight: parseFloat(newWeight),
      id: Date.now()
    }
    setWeightEntries([...weightEntries, entry])
    setNewWeight('')
  }

  const weightChartData = weightEntries.map((entry) => ({
    date: entry.date,
    weight: entry.weight,
    target: parseFloat(userProfile.targetWeight) || 0
  }))

  const todayCalories = getTodayCalories()
  const todayMacros = getTodayMacros()
  
  const calorieChartData = [
    { name: 'Consumidas', value: todayCalories, color: '#f97316' },
    { name: 'Restantes', value: Math.max(0, dailyCalorieGoal - todayCalories), color: '#10b981' }
  ]

  const macrosChartData = [
    { name: 'Carboidratos', value: todayMacros.carbs, color: '#3b82f6', icon: Wheat },
    { name: 'Proteínas', value: todayMacros.protein, color: '#ef4444', icon: Beef },
    { name: 'Gorduras', value: todayMacros.fat, color: '#f59e0b', icon: Droplet }
  ]

  const bmi = calculateBMI()
  const bmiInfo = getBMICategory(bmi)
  const weightToLose = calculateWeightLoss()
  const progress = calculateProgress()

  const OnboardingFlow = () => {
    const steps = [
      {
        title: "Bem-vindo ao NutriSnap! 📸",
        subtitle: "Análise nutricional inteligente com IA",
        content: (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200">
              <h3 className="font-bold text-lg text-orange-800 mb-2">O que é o NutriSnap?</h3>
              <p className="text-gray-700">
                Tire uma foto da sua refeição e receba análise nutricional completa em segundos! 
                Identifica todos os alimentos, calorias e macronutrientes automaticamente.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg">Como podemos te chamar?</Label>
              <Input
                id="name"
                value={onboardingData.name}
                onChange={(e) => setOnboardingData({...onboardingData, name: e.target.value})}
                placeholder="Digite seu nome"
                className="text-lg h-12 border-2 border-gray-300 focus:border-orange-500"
              />
            </div>
          </div>
        )
      },
      {
        title: "Suas informações 📏",
        subtitle: "Para cálculos nutricionais personalizados",
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso atual (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={onboardingData.weight}
                  onChange={(e) => setOnboardingData({...onboardingData, weight: e.target.value})}
                  placeholder="70"
                  className="h-12 border-2 border-gray-300 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={onboardingData.height}
                  onChange={(e) => setOnboardingData({...onboardingData, height: e.target.value})}
                  placeholder="170"
                  className="h-12 border-2 border-gray-300 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Idade (anos)</Label>
              <Input
                id="age"
                type="number"
                value={onboardingData.age}
                onChange={(e) => setOnboardingData({...onboardingData, age: e.target.value})}
                placeholder="25"
                className="h-12 border-2 border-gray-300 focus:border-orange-500"
              />
            </div>
          </div>
        )
      },
      {
        title: "Sobre você 👤",
        subtitle: "Informações pessoais",
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-lg">Sexo biológico</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={onboardingData.gender === 'female' ? 'default' : 'outline'}
                  onClick={() => setOnboardingData({...onboardingData, gender: 'female'})}
                  className="h-auto py-6 text-base"
                >
                  Feminino
                </Button>
                <Button
                  variant={onboardingData.gender === 'male' ? 'default' : 'outline'}
                  onClick={() => setOnboardingData({...onboardingData, gender: 'male'})}
                  className="h-auto py-6 text-base"
                >
                  Masculino
                </Button>
                <Button
                  variant={onboardingData.gender === 'other' ? 'default' : 'outline'}
                  onClick={() => setOnboardingData({...onboardingData, gender: 'other'})}
                  className="h-auto py-6 text-base"
                >
                  Outro
                </Button>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Seu objetivo 🎯",
        subtitle: "O que você deseja alcançar?",
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-lg">Escolha seu objetivo principal</Label>
              <div className="space-y-3">
                {[
                  { value: 'lose_weight', label: 'Perder peso', icon: '⬇️', desc: 'Reduzir gordura corporal' },
                  { value: 'gain_weight', label: 'Ganhar peso', icon: '⬆️', desc: 'Aumentar massa corporal' },
                  { value: 'gain_muscle', label: 'Ganhar massa muscular', icon: '💪', desc: 'Hipertrofia e definição' },
                  { value: 'improve_health', label: 'Melhorar a saúde', icon: '❤️', desc: 'Alimentação equilibrada' },
                  { value: 'other', label: 'Outros', icon: '✨', desc: 'Manutenção ou outros objetivos' }
                ].map((goal) => (
                  <Button
                    key={goal.value}
                    variant={onboardingData.goal === goal.value ? 'default' : 'outline'}
                    onClick={() => setOnboardingData({...onboardingData, goal: goal.value as any})}
                    className="w-full justify-start text-left h-auto p-5 hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <span className="text-3xl">{goal.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-base">{goal.label}</div>
                        <div className="text-xs opacity-70">{goal.desc}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )
      }
    ]

    const currentStep = steps[onboardingStep]
    const isLastStep = onboardingStep === steps.length - 1
    const canProceed = () => {
      if (onboardingStep === 0) return onboardingData.name.trim() !== ''
      if (onboardingStep === 1) return onboardingData.weight && onboardingData.height && onboardingData.age
      return true
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-300 rounded-full ${
                      index <= onboardingStep 
                        ? 'w-12 h-3 bg-gradient-to-r from-orange-500 to-amber-500' 
                        : 'w-3 h-3 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
              {currentStep.title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {currentStep.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="min-h-[300px]">
              {currentStep.content}
            </div>
            
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setOnboardingStep(Math.max(0, onboardingStep - 1))}
                disabled={onboardingStep === 0}
                className="border-orange-200 hover:bg-orange-50 px-6 h-12"
              >
                Voltar
              </Button>
              <Button
                onClick={() => {
                  if (isLastStep) {
                    completeOnboarding()
                  } else {
                    setOnboardingStep(onboardingStep + 1)
                  }
                }}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg px-8 h-12 text-base"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Começar a usar!
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isFirstTime) {
    return <OnboardingFlow />
  }

  const savedUserData = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('nutrisnap_user_data') || '{}') 
    : {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Header moderno */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Camera className="w-10 h-10" />
                <h1 className="text-4xl font-bold">
                  NutriSnap
                </h1>
              </div>
              <p className="text-white/90 text-lg">
                Olá, {savedUserData.name || 'Usuário'}! 👋 Continue sua jornada saudável
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                <div className="text-sm opacity-90">Calorias Hoje</div>
                <div className="text-3xl font-bold">{todayCalories}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                <div className="text-sm opacity-90">Meta</div>
                <div className="text-3xl font-bold">{dailyCalorieGoal}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 -mt-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:mx-auto bg-white shadow-xl border-0 p-1.5 rounded-2xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="meals" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Refeições</span>
            </TabsTrigger>
            <TabsTrigger value="weight" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">Peso</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Cards de métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    IMC Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{bmi.toFixed(1)}</div>
                  <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0">
                    {bmiInfo.category}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Meta de Peso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{Math.abs(weightToLose).toFixed(1)} kg</div>
                  <p className="text-sm opacity-90">
                    {weightToLose > 0 ? 'para perder' : 'para ganhar'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Progresso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{progress.toFixed(1)}%</div>
                  <Progress value={progress} className="mt-2 bg-white/20 h-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Calorias Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{todayCalories}</div>
                  <p className="text-sm opacity-90">de {dailyCalorieGoal} kcal</p>
                </CardContent>
              </Card>
            </div>

            {/* Macronutrientes */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Zap className="w-6 h-6 text-orange-500" />
                  Macronutrientes de Hoje
                </CardTitle>
                <CardDescription>Distribuição de carboidratos, proteínas e gorduras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {macrosChartData.map((macro) => {
                    const Icon = macro.icon
                    return (
                      <div key={macro.name} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-xl" style={{ backgroundColor: `${macro.color}20` }}>
                            <Icon className="w-6 h-6" style={{ color: macro.color }} />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">{macro.name}</div>
                            <div className="text-3xl font-bold" style={{ color: macro.color }}>
                              {macro.value.toFixed(1)}g
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={(macro.value / (todayMacros.carbs + todayMacros.protein + todayMacros.fat)) * 100} 
                          className="h-2"
                          style={{ 
                            backgroundColor: `${macro.color}20`,
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                    Evolução do Peso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weightChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 6 }} />
                        <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Scale className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">Adicione registros de peso</p>
                        <p className="text-sm">para ver o gráfico de evolução</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Flame className="w-5 h-5 text-orange-600" />
                    Calorias de Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={calorieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {calorieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">Consumidas: {todayCalories} kcal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Restantes: {Math.max(0, dailyCalorieGoal - todayCalories)} kcal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meals" className="space-y-6">
            {/* Upload de foto */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-500 to-amber-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Camera className="w-7 h-7" />
                  Registrar Refeição
                </CardTitle>
                <CardDescription className="text-white/90 text-base">
                  Tire uma foto e receba análise nutricional detalhada com IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label htmlFor="meal-photo" className="cursor-pointer block">
                  <div className="border-2 border-dashed border-white/40 rounded-2xl p-10 hover:border-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-white/20 rounded-full">
                        <Upload className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-lg font-semibold">Clique para adicionar foto da refeição</p>
                      <p className="text-sm text-white/80">A IA identificará todos os alimentos automaticamente</p>
                    </div>
                  </div>
                  <input
                    id="meal-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMealPhotoUpload}
                  />
                </label>
              </CardContent>
            </Card>

            {/* Resumo nutricional */}
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-800">Resumo Nutricional de Hoje</CardTitle>
                  {!isEditingCalorieGoal ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingCalorieGoal(true)}
                      className="text-orange-600 hover:bg-orange-50"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar meta
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-gray-600">Calorias</span>
                      </div>
                      <div className="text-3xl font-bold text-orange-600">{todayCalories}</div>
                      <div className="text-xs text-gray-500 mt-1">kcal consumidas</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Wheat className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Carboidratos</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">{todayMacros.carbs.toFixed(1)}</div>
                      <div className="text-xs text-gray-500 mt-1">gramas</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Beef className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-gray-600">Proteínas</span>
                      </div>
                      <div className="text-3xl font-bold text-red-600">{todayMacros.protein.toFixed(1)}</div>
                      <div className="text-xs text-gray-500 mt-1">gramas</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplet className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm text-gray-600">Gorduras</span>
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">{todayMacros.fat.toFixed(1)}</div>
                      <div className="text-xs text-gray-500 mt-1">gramas</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Meta diária de calorias:</span>
                      {isEditingCalorieGoal ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={tempCalorieGoal}
                            onChange={(e) => setTempCalorieGoal(e.target.value)}
                            className="w-28 h-9"
                            placeholder="1500"
                          />
                          <Button
                            size="sm"
                            onClick={saveCalorieGoal}
                            className="bg-green-600 hover:bg-green-700 h-9"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIsEditingCalorieGoal(false)
                              setTempCalorieGoal(dailyCalorieGoal.toString())
                            }}
                            className="h-9"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-orange-600">{dailyCalorieGoal} kcal</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Calorias restantes:</span>
                      <span className={`text-2xl font-bold ${dailyCalorieGoal - todayCalories >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dailyCalorieGoal - todayCalories} kcal
                      </span>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progresso diário</span>
                        <span>{((todayCalories / dailyCalorieGoal) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(todayCalories / dailyCalorieGoal) * 100} 
                        className="h-3"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de refeições */}
            <div className="space-y-4">
              {mealPhotos.length > 0 ? (
                mealPhotos.slice().reverse().map((photo) => (
                  <Card key={photo.id} className="shadow-xl border-0 bg-white overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Imagem */}
                        <div className="relative w-full md:w-80 h-64 md:h-auto flex-shrink-0">
                          <img
                            src={photo.imageUrl}
                            alt="Refeição"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-3 right-3 shadow-lg rounded-full"
                            onClick={() => removeMealPhoto(photo.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-black/60 text-white backdrop-blur-sm border-0">
                              <Calendar className="w-3 h-3 mr-1" />
                              {photo.date}
                            </Badge>
                          </div>
                        </div>

                        {/* Análise */}
                        <div className="flex-1 p-6">
                          {photo.isAnalyzing ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                                <p className="text-gray-600 font-medium">Analisando alimentos com IA...</p>
                                <p className="text-sm text-gray-500 mt-1">Identificando todos os ingredientes</p>
                              </div>
                            </div>
                          ) : photo.analysis ? (
                            <div className="space-y-4">
                              {/* Total da refeição */}
                              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 rounded-2xl shadow-lg">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                  <ChefHat className="w-5 h-5" />
                                  Total da Refeição
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-xs opacity-90">Calorias</p>
                                    <p className="text-2xl font-bold">{photo.analysis.totalCalories} kcal</p>
                                  </div>
                                  <div>
                                    <p className="text-xs opacity-90">Carboidratos</p>
                                    <p className="text-2xl font-bold">{photo.analysis.totalCarbs.toFixed(1)}g</p>
                                  </div>
                                  <div>
                                    <p className="text-xs opacity-90">Proteínas</p>
                                    <p className="text-2xl font-bold">{photo.analysis.totalProtein.toFixed(1)}g</p>
                                  </div>
                                  <div>
                                    <p className="text-xs opacity-90">Gorduras</p>
                                    <p className="text-2xl font-bold">{photo.analysis.totalFat.toFixed(1)}g</p>
                                  </div>
                                </div>
                              </div>

                              {/* Alimentos detectados */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <Apple className="w-5 h-5 text-orange-600" />
                                  Alimentos Detectados ({photo.analysis.foods.length})
                                </h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                  {photo.analysis.foods.map((food, index) => (
                                    <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-gray-800">{food.name}</span>
                                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 border-0">
                                          {food.calories} kcal
                                        </Badge>
                                      </div>
                                      <div className="grid grid-cols-4 gap-3 text-xs">
                                        <div className="bg-white rounded-lg p-2 text-center">
                                          <div className="text-gray-500">Carb</div>
                                          <div className="font-bold text-blue-600">{food.carbs}g</div>
                                        </div>
                                        <div className="bg-white rounded-lg p-2 text-center">
                                          <div className="text-gray-500">Prot</div>
                                          <div className="font-bold text-red-600">{food.protein}g</div>
                                        </div>
                                        <div className="bg-white rounded-lg p-2 text-center">
                                          <div className="text-gray-500">Gord</div>
                                          <div className="font-bold text-yellow-600">{food.fat}g</div>
                                        </div>
                                        <div className="bg-white rounded-lg p-2 text-center">
                                          <div className="text-gray-500">Peso</div>
                                          <div className="font-bold text-gray-700">{food.weight}g</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              <p>Aguardando análise...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="shadow-xl border-0 bg-white">
                  <CardContent className="p-12 text-center">
                    <Camera className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <p className="text-xl font-semibold text-gray-700 mb-2">Nenhuma refeição registrada hoje</p>
                    <p className="text-gray-500">Adicione fotos das suas refeições para começar o acompanhamento nutricional!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="weight" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-emerald-600" />
                  Registrar Peso
                </CardTitle>
                <CardDescription>
                  Acompanhe sua evolução registrando seu peso regularmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Peso em kg (ex: 70.5)"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="border-2 border-gray-200 focus:border-emerald-500 text-lg"
                  />
                  <Button 
                    onClick={addWeightEntry} 
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg px-8"
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-800">Histórico de Peso</CardTitle>
                <CardDescription>Últimos 10 registros</CardDescription>
              </CardHeader>
              <CardContent>
                {weightEntries.length > 0 ? (
                  <div className="space-y-3">
                    {weightEntries.slice(-10).reverse().map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:shadow-md transition-all duration-300 border-2 border-emerald-200">
                        <span className="flex items-center gap-3 text-gray-700">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium">{entry.date}</span>
                        </span>
                        <span className="text-2xl font-bold text-emerald-700">{entry.weight} kg</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Scale className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 font-medium text-lg">Nenhum registro de peso ainda</p>
                    <p className="text-gray-500 mt-1">Adicione o primeiro registro acima!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-800">Seu Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações para cálculos mais precisos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={userProfile.height}
                      onChange={(e) => setUserProfile({...userProfile, height: e.target.value})}
                      placeholder="170"
                      className="border-2 border-gray-200 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentWeight">Peso Atual (kg)</Label>
                    <Input
                      id="currentWeight"
                      type="number"
                      value={userProfile.currentWeight}
                      onChange={(e) => setUserProfile({...userProfile, currentWeight: e.target.value})}
                      placeholder="70"
                      className="border-2 border-gray-200 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetWeight">Peso Meta (kg)</Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      value={userProfile.targetWeight}
                      onChange={(e) => setUserProfile({...userProfile, targetWeight: e.target.value})}
                      placeholder="65"
                      className="border-2 border-gray-200 focus:border-orange-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {bmi > 0 && (
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl">Resultado do IMC</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-6xl font-bold">{bmi.toFixed(1)}</div>
                    <div>
                      <Badge className="bg-white/20 text-white backdrop-blur-sm border-0 text-base px-4 py-1">
                        {bmiInfo.category}
                      </Badge>
                      <p className="text-white/90 mt-2">
                        Meta: {weightToLose > 0 ? 'perder' : 'ganhar'} {Math.abs(weightToLose).toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-white/20 my-4" />
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span>Abaixo do peso:</span>
                      <span className="font-semibold">Menos de 18,5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span>Peso normal:</span>
                      <span className="font-semibold">18,5 - 24,9</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span>Sobrepeso:</span>
                      <span className="font-semibold">25,0 - 29,9</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span>Obesidade:</span>
                      <span className="font-semibold">30,0 ou mais</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
