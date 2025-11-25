'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Delete, Divide, Minus, Plus, X, Equal, History, Calendar } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

type CalculatorMode = 'basic' | 'scientific' | 'programmer' | 'date';

export default function CalculatorPage() {
  const { t } = useLanguage();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [mode, setMode] = useState<CalculatorMode>('basic');
  const [numberSystem, setNumberSystem] = useState<'BIN' | 'DEC' | 'HEX' | 'OCT'>('DEC');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Date calculator states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daysToAdd, setDaysToAdd] = useState('0');
  const [dateResult, setDateResult] = useState('');

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleNumber(e.key);
      }
      // Operators
      else if (e.key === '+') {
        e.preventDefault();
        handleOperation('+');
      }
      else if (e.key === '-') {
        e.preventDefault();
        handleOperation('-');
      }
      else if (e.key === '*') {
        e.preventDefault();
        handleOperation('×');
      }
      else if (e.key === '/') {
        e.preventDefault();
        handleOperation('÷');
      }
      else if (e.key === '%') {
        e.preventDefault();
        handleOperation('%');
      }
      // Special keys
      else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      }
      else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
      else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
      else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDecimal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, previousValue, operation, newNumber]);


  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      case '%': return a % b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      
      // Add to history
      const historyEntry = `${previousValue} ${operation} ${current} = ${result}`;
      setHistory(prev => [historyEntry, ...prev].slice(0, 20)); // Keep last 20
      
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const handleScientific = (func: string) => {
    const current = parseFloat(display);
    let result: number;
    
    switch (func) {
      case 'sin': result = Math.sin(current * Math.PI / 180); break;
      case 'cos': result = Math.cos(current * Math.PI / 180); break;
      case 'tan': result = Math.tan(current * Math.PI / 180); break;
      case 'log': result = Math.log10(current); break;
      case 'ln': result = Math.log(current); break;
      case 'sqrt': result = Math.sqrt(current); break;
      case 'x²': result = current * current; break;
      case 'x³': result = current * current * current; break;
      case '1/x': result = 1 / current; break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      default: result = current;
    }
    
    setDisplay(String(result));
    setNewNumber(true);
  };

  // Programmer mode functions
  const convertToSystem = (value: number, system: 'BIN' | 'DEC' | 'HEX' | 'OCT'): string => {
    const int = Math.floor(value);
    switch (system) {
      case 'BIN': return int.toString(2);
      case 'DEC': return int.toString(10);
      case 'HEX': return int.toString(16).toUpperCase();
      case 'OCT': return int.toString(8);
    }
  };

  const convertFromSystem = (value: string, system: 'BIN' | 'DEC' | 'HEX' | 'OCT'): number => {
    switch (system) {
      case 'BIN': return parseInt(value, 2);
      case 'DEC': return parseInt(value, 10);
      case 'HEX': return parseInt(value, 16);
      case 'OCT': return parseInt(value, 8);
    }
  };

  const handleBitwise = (op: string) => {
    const current = convertFromSystem(display, numberSystem);
    
    if (previousValue === null) {
      setPreviousValue(current);
      setOperation(op);
      setNewNumber(true);
    } else if (operation) {
      let result: number;
      switch (operation) {
        case 'AND': result = previousValue & current; break;
        case 'OR': result = previousValue | current; break;
        case 'XOR': result = previousValue ^ current; break;
        case '<<': result = previousValue << current; break;
        case '>>': result = previousValue >> current; break;
        default: result = current;
      }
      setDisplay(convertToSystem(result, numberSystem));
      setPreviousValue(result);
      setOperation(op);
      setNewNumber(true);
    }
  };

  const handleNOT = () => {
    const current = convertFromSystem(display, numberSystem);
    const result = ~current;
    setDisplay(convertToSystem(result, numberSystem));
    setNewNumber(true);
  };

  const handleSystemChange = (system: 'BIN' | 'DEC' | 'HEX' | 'OCT') => {
    const currentValue = convertFromSystem(display, numberSystem);
    setNumberSystem(system);
    setDisplay(convertToSystem(currentValue, system));
  };

  const handleProgrammerNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  // Date calculator functions
  const calculateDateDifference = () => {
    if (!startDate || !endDate) {
      setDateResult('Please select both dates');
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffDays / 365.25);
    
    setDateResult(
      `${diffDays} days\n${diffWeeks} weeks\n${diffMonths} months\n${diffYears} years`
    );
  };

  const addDaysToDate = () => {
    if (!startDate) {
      setDateResult('Please select a start date');
      return;
    }
    
    const date = new Date(startDate);
    const days = parseInt(daysToAdd);
    date.setDate(date.getDate() + days);
    
    setDateResult(`Result: ${date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`);
  };


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('calculator.title')}</h1>
          <p className="text-muted-foreground">
            {t('calculator.subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowHistory(!showHistory)}
          className="h-10 w-10"
        >
          <History className="h-5 w-5" />
        </Button>
      </div>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('calculator.history')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-lg font-mono text-sm"
                >
                  {entry}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistory([])}
              className="w-full mt-4"
            >
              {t('calculator.clearHistory')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={mode} onValueChange={(v) => setMode(v as CalculatorMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">{t('calculator.basic')}</TabsTrigger>
          <TabsTrigger value="scientific">{t('calculator.scientific')}</TabsTrigger>
          <TabsTrigger value="programmer">{t('calculator.programmer')}</TabsTrigger>
          <TabsTrigger value="date">{t('calculator.date')}</TabsTrigger>
        </TabsList>

        {/* Basic Calculator */}
        <TabsContent value="basic">
          <Card className="border-2 max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Basic Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display */}
              <div className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 border-2 border-pink-500/20 rounded-lg p-6">
                <div className="text-right text-4xl font-bold font-mono break-all">
                  {display}
                </div>
                {operation && (
                  <div className="text-right text-sm text-muted-foreground mt-2">
                    {previousValue} {operation}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" onClick={handleClear} className="h-14 text-lg">C</Button>
                <Button variant="outline" onClick={handleBackspace} className="h-14"><Delete className="h-5 w-5" /></Button>
                <Button variant="outline" onClick={() => handleOperation('%')} className="h-14 text-lg">%</Button>
                <Button variant="default" onClick={() => handleOperation('÷')} className="h-14 bg-gradient-to-r from-pink-500 to-violet-500"><Divide className="h-5 w-5" /></Button>

                <Button variant="outline" onClick={() => handleNumber('7')} className="h-14 text-lg">7</Button>
                <Button variant="outline" onClick={() => handleNumber('8')} className="h-14 text-lg">8</Button>
                <Button variant="outline" onClick={() => handleNumber('9')} className="h-14 text-lg">9</Button>
                <Button variant="default" onClick={() => handleOperation('×')} className="h-14 bg-gradient-to-r from-pink-500 to-violet-500"><X className="h-5 w-5" /></Button>

                <Button variant="outline" onClick={() => handleNumber('4')} className="h-14 text-lg">4</Button>
                <Button variant="outline" onClick={() => handleNumber('5')} className="h-14 text-lg">5</Button>
                <Button variant="outline" onClick={() => handleNumber('6')} className="h-14 text-lg">6</Button>
                <Button variant="default" onClick={() => handleOperation('-')} className="h-14 bg-gradient-to-r from-pink-500 to-violet-500"><Minus className="h-5 w-5" /></Button>

                <Button variant="outline" onClick={() => handleNumber('1')} className="h-14 text-lg">1</Button>
                <Button variant="outline" onClick={() => handleNumber('2')} className="h-14 text-lg">2</Button>
                <Button variant="outline" onClick={() => handleNumber('3')} className="h-14 text-lg">3</Button>
                <Button variant="default" onClick={() => handleOperation('+')} className="h-14 bg-gradient-to-r from-pink-500 to-violet-500"><Plus className="h-5 w-5" /></Button>

                <Button variant="outline" onClick={() => handleNumber('0')} className="h-14 text-lg col-span-2">0</Button>
                <Button variant="outline" onClick={handleDecimal} className="h-14 text-lg">.</Button>
                <Button onClick={handleEquals} className="h-14 bg-gradient-to-r from-green-500 to-emerald-500"><Equal className="h-5 w-5" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scientific Calculator */}
        <TabsContent value="scientific">
          <Card className="border-2 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Scientific Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display */}
              <div className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 border-2 border-pink-500/20 rounded-lg p-6">
                <div className="text-right text-4xl font-bold font-mono break-all">
                  {display}
                </div>
                {operation && (
                  <div className="text-right text-sm text-muted-foreground mt-2">
                    {previousValue} {operation}
                  </div>
                )}
              </div>

              {/* Scientific Functions */}
              <div className="grid grid-cols-5 gap-2">
                <Button variant="secondary" onClick={() => handleScientific('sin')} className="h-12">sin</Button>
                <Button variant="secondary" onClick={() => handleScientific('cos')} className="h-12">cos</Button>
                <Button variant="secondary" onClick={() => handleScientific('tan')} className="h-12">tan</Button>
                <Button variant="secondary" onClick={() => handleScientific('log')} className="h-12">log</Button>
                <Button variant="secondary" onClick={() => handleScientific('ln')} className="h-12">ln</Button>

                <Button variant="secondary" onClick={() => handleScientific('sqrt')} className="h-12">√</Button>
                <Button variant="secondary" onClick={() => handleScientific('x²')} className="h-12">x²</Button>
                <Button variant="secondary" onClick={() => handleScientific('x³')} className="h-12">x³</Button>
                <Button variant="secondary" onClick={() => handleScientific('1/x')} className="h-12">1/x</Button>
                <Button variant="secondary" onClick={() => handleScientific('π')} className="h-12">π</Button>
              </div>

              {/* Basic Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" onClick={handleClear} className="h-14 text-lg">C</Button>
                <Button variant="outline" onClick={handleBackspace} className="h-14"><Delete className="h-5 w-5" /></Button>
                <Button variant="outline" onClick={() => handleOperation('%')} className="h-14 text-lg">%</Button>
                <Button variant="default" onClick={() => handleOperation('÷')} className="h-14 bg-gradient-to-r from-pink-500 to-violet-500"><Divide className="h-5 w-5" /></Button>

                <Button variant="outline" onClick={() => handleNumber('7')} className="h-14 text-lg">7</Button>
                <Button variant="outline" onClick={() => handleNumber('8')} className="h-14 text-lg">8</Button>
                <Button variant="outline" onClick={() => handleNumber('9')} className="h-14 text-lg">9</Button>
                <Button variant="default" onClick={() => handleOperation('×')} className="h-14 bg-gradient-to-r from-pink-500 to-violet-500"><X className="h-5 w-5" /></Button>

                <Button variant="outline" onClick={() => handleNumber('4')} className="h-14 text-lg">4</Button>
                <Button variant="outline" onClick={() => handleNumber('5')} className="h-14 text-lg">5</Button>
                <Button variant="outline" onClick={() => handleNumber('6')} className="h-14 text-lg">6</Button>
                <Button variant="default" onClick={() => handleOperation('-')} className="h-14 bg-gradient-to-r from-pink-500 to-violet-500"><Minus className="h-5 w-5" /></Button>

                <Button variant="outline" onClick={() => handleNumber('1')} className="h-14 text-lg">1</Button>
                <Button variant="outline" onClick={() => handleNumber('2')} className="h-14 text-lg">2</Button>
                <Button variant="outline" onClick={() => handleNumber('3')} className="h-14 text-lg">3</Button>
                <Button variant="default" onClick={() => handleOperation('+')} className="h-14 bg-gradient-to-r from-pink-500 to-violet-500"><Plus className="h-5 w-5" /></Button>

                <Button variant="outline" onClick={() => handleNumber('0')} className="h-14 text-lg col-span-2">0</Button>
                <Button variant="outline" onClick={handleDecimal} className="h-14 text-lg">.</Button>
                <Button onClick={handleEquals} className="h-14 bg-gradient-to-r from-green-500 to-emerald-500"><Equal className="h-5 w-5" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programmer Calculator */}
        <TabsContent value="programmer">
          <Card className="border-2 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Programmer Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Number System Selector */}
              <div className="grid grid-cols-4 gap-2">
                {(['BIN', 'DEC', 'HEX', 'OCT'] as const).map((sys) => (
                  <Button
                    key={sys}
                    variant={numberSystem === sys ? 'default' : 'outline'}
                    onClick={() => handleSystemChange(sys)}
                    className={numberSystem === sys ? 'bg-gradient-to-r from-pink-500 to-violet-500' : ''}
                  >
                    {sys}
                  </Button>
                ))}
              </div>

              {/* Display */}
              <div className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 border-2 border-pink-500/20 rounded-lg p-6">
                <div className="text-right text-4xl font-bold font-mono break-all">
                  {display}
                </div>
                {operation && (
                  <div className="text-right text-sm text-muted-foreground mt-2">
                    {previousValue} {operation}
                  </div>
                )}
                <div className="text-right text-xs text-muted-foreground mt-2">
                  {numberSystem === 'DEC' && `BIN: ${convertToSystem(convertFromSystem(display, numberSystem), 'BIN')}`}
                  {numberSystem === 'BIN' && `DEC: ${convertToSystem(convertFromSystem(display, numberSystem), 'DEC')}`}
                  {numberSystem === 'HEX' && `DEC: ${convertToSystem(convertFromSystem(display, numberSystem), 'DEC')}`}
                  {numberSystem === 'OCT' && `DEC: ${convertToSystem(convertFromSystem(display, numberSystem), 'DEC')}`}
                </div>
              </div>

              {/* Bitwise Operations */}
              <div className="grid grid-cols-6 gap-2">
                <Button variant="secondary" onClick={() => handleBitwise('AND')} className="h-12">AND</Button>
                <Button variant="secondary" onClick={() => handleBitwise('OR')} className="h-12">OR</Button>
                <Button variant="secondary" onClick={() => handleBitwise('XOR')} className="h-12">XOR</Button>
                <Button variant="secondary" onClick={handleNOT} className="h-12">NOT</Button>
                <Button variant="secondary" onClick={() => handleBitwise('<<')} className="h-12">&lt;&lt;</Button>
                <Button variant="secondary" onClick={() => handleBitwise('>>')} className="h-12">&gt;&gt;</Button>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" onClick={handleClear} className="h-14 text-lg">C</Button>
                <Button variant="outline" onClick={handleBackspace} className="h-14"><Delete className="h-5 w-5" /></Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('A')} 
                  className="h-14 text-lg"
                  disabled={numberSystem !== 'HEX'}
                >
                  A
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('B')} 
                  className="h-14 text-lg"
                  disabled={numberSystem !== 'HEX'}
                >
                  B
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('7')} 
                  className="h-14 text-lg"
                  disabled={numberSystem === 'BIN'}
                >
                  7
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('8')} 
                  className="h-14 text-lg"
                  disabled={numberSystem === 'BIN' || numberSystem === 'OCT'}
                >
                  8
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('9')} 
                  className="h-14 text-lg"
                  disabled={numberSystem === 'BIN' || numberSystem === 'OCT'}
                >
                  9
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('C')} 
                  className="h-14 text-lg"
                  disabled={numberSystem !== 'HEX'}
                >
                  C
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('4')} 
                  className="h-14 text-lg"
                  disabled={numberSystem === 'BIN'}
                >
                  4
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('5')} 
                  className="h-14 text-lg"
                  disabled={numberSystem === 'BIN'}
                >
                  5
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('6')} 
                  className="h-14 text-lg"
                  disabled={numberSystem === 'BIN'}
                >
                  6
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('D')} 
                  className="h-14 text-lg"
                  disabled={numberSystem !== 'HEX'}
                >
                  D
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('1')} 
                  className="h-14 text-lg"
                >
                  1
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('2')} 
                  className="h-14 text-lg"
                  disabled={numberSystem === 'BIN'}
                >
                  2
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('3')} 
                  className="h-14 text-lg"
                  disabled={numberSystem === 'BIN'}
                >
                  3
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('E')} 
                  className="h-14 text-lg"
                  disabled={numberSystem !== 'HEX'}
                >
                  E
                </Button>

                <Button variant="outline" onClick={() => handleProgrammerNumber('0')} className="h-14 text-lg col-span-2">0</Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleProgrammerNumber('F')} 
                  className="h-14 text-lg col-span-2"
                  disabled={numberSystem !== 'HEX'}
                >
                  F
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Date Calculator */}
        <TabsContent value="date">
          <Card className="border-2 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Difference Calculator */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Calculate Date Difference</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
                <Button
                  onClick={calculateDateDifference}
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-violet-500"
                >
                  Calculate Difference
                </Button>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Add/Subtract Days</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Days to Add/Subtract</label>
                    <Input
                      type="number"
                      value={daysToAdd}
                      onChange={(e) => setDaysToAdd(e.target.value)}
                      placeholder="Enter days (use - for subtract)"
                      className="h-12"
                    />
                  </div>
                </div>
                <Button
                  onClick={addDaysToDate}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  Calculate Result Date
                </Button>
              </div>

              {/* Result Display */}
              {dateResult && (
                <div className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 border-2 border-pink-500/20 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Result:</h3>
                  <div className="text-lg font-mono whitespace-pre-line">
                    {dateResult}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
