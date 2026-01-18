// app/page.tsx
'use client';

// --- IMPORTANT: Import usePathname from navigation ---
import { useEffect, useState, useRef, FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname
import { useChat } from '@ai-sdk/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, History, FilePlus, Trash2, Settings, SendHorizonal } from 'lucide-react';
import type { Query } from '@prisma/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

async function getHistory(): Promise<Query[]> {
  const res = await fetch('/api/history');
  if (!res.ok) {
    if (res.status !== 404) {
      toast.error('Failed to fetch conversation history.');
    }
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

const ExamplePrompts = ({ setInput }: { setInput: (value: string) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => setInput("What is intrinsic value?")} className="p-6 text-left justify-start h-auto">
          <div className="flex flex-col items-start">
            <p className="font-semibold">Explain Intrinsic Value</p>
            <p className="text-sm text-muted-foreground text-wrap">What is it and why does Buffett focus on it?</p>
          </div>
      </Button>
      <Button variant="outline" onClick={() => setInput("Summarize Buffett's view on market forecasts.")} className="p-6 text-left justify-start h-auto">
          <div className="flex flex-col items-start">
            <p className="font-semibold">Market Forecasts</p>
            <p className="text-sm text-muted-foreground text-wrap">Summarize Buffetts view on market forecasts.</p>
          </div>
      </Button>
  </div>
);


export default function Chat() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // --- FIX #1: Get the pathname using the correct hook ---
  const pathname = usePathname();

  const { messages, setMessages, sendMessage } = useChat({
    onError: (err) => {
      toast.error(`An error occurred: ${err.message}`);
    },
  });

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Query[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      setIsHistoryLoading(true);
      getHistory().then(setHistory).finally(() => setIsHistoryLoading(false));
    }
  }, [status, router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ role: 'user', content: input });
    setInput('');
  };

  const loadConversation = (selectedQuery: Query) => {
    setMessages([
      { id: '1', role: 'user', content: selectedQuery.query },
      { id: '2', role: 'assistant', content: selectedQuery.response },
    ]);
    setShowHistory(false);
  };

  const resetConversation = () => {
    setMessages([]);
    toast.success('New conversation started.');
  };

  const handleDelete = async (queryId: string) => { /* ... existing code ... */ };

  // --- FIX #2: Use the 'pathname' variable for the check. This prevents the crash. ---
  if (status === 'loading' || (status === 'unauthenticated' && pathname !== '/login')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-4 w-[250px]" /><Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <aside className={`flex flex-col border-r bg-gray-100/40 dark:bg-gray-900/40 transition-all duration-300 ${showHistory ? 'w-80 p-4' : 'w-0'}`}>
        {showHistory && (
          <>
            <h2 className="text-lg font-semibold mb-4">Conversation History</h2>
            <ScrollArea className="flex-1">
              {isHistoryLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadConversation(item)}
                      className="group flex justify-between items-center p-2 border rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">{item.query}</p>
                        <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete this conversation. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </aside>

      <div className="flex flex-col flex-1 bg-background">
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Image src="/investMind.png" alt="InvestMind Logo" width={40} height={40} />
            <h1 className="text-xl font-bold">InvestMind</h1>
          </div>
          <div className="flex items-center gap-2">
             <ThemeToggle />
            <Button variant="outline" size="sm" onClick={resetConversation}>
                <FilePlus className="h-4 w-4 mr-2"/>New Chat
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="relative h-9 w-auto px-4">{session?.user?.name}</Button></DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
                {/* --- FIX #3: Make the sign-out redirect explicit and immediate --- */}
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="space-y-4 max-w-4xl mx-auto p-4 flex flex-col justify-end min-h-full">
            {messages.length === 0 &&  (
                <div className="text-center text-gray-500 my-auto">
                    <Image src="/investMind.png" alt="InvestMind Logo" width={80} height={80} className="mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-8">How can I help you today?</h2>
                    <ExamplePrompts setInput={setInput} />
                </div>
            )}
            {messages.map((m) => (
              <Card key={m.id} className={`${m.role === 'user' ? 'bg-muted self-end' : 'bg-card self-start'} w-auto max-w-xl`}>
                <CardContent className="p-4">
                  <p className="font-semibold text-sm mb-2">{m.role === 'user' ? 'You' : 'InvestMind AI'}</p>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </CardContent>
              </Card>
            ))}
             { (
              <Card className="bg-card self-start">
                <CardContent className="p-4">
                   <p className="font-semibold text-sm mb-2">InvestMind AI</p>
                   <div className="flex items-center space-x-2 animate-pulse">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                   </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <footer className="p-4 bg-card border-t">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <Input
                value={input}
                placeholder="What is Buffett's view on market volatility?"
                onChange={(e) => setInput(e.target.value)}
                // disabled={isLoading}
                className="pr-12 h-12"
              />
              <Button type="submit" size="icon"
              //  disabled={isLoading || !input.trim()} 
               className="absolute right-2 top-1/2 -translate-y-1/2">
                <SendHorizonal className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}