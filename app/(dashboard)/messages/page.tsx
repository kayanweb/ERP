'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquare, Plus, Search, Send, Star, Trash2,
  Reply, AlertCircle, Clock, Check, CheckCheck,
  Inbox, SendHorizontal, Archive, Printer,
  X, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WhatsAppSendDialog } from '@/components/whatsapp-send'
import { useLang } from '@/contexts/lang-context'

// ─── Types ───────────────────────────────────────────────────────────────────
type Priority = 'normal' | 'high' | 'urgent'

interface MsgReply {
  id: string
  fromName: string
  content: string
  timestamp: string
}

interface Msg {
  id: string
  fromId: string
  fromName: string
  toId: string
  toName: string
  subject: string
  content: string
  priority: Priority
  read: boolean
  starred: boolean
  archived: boolean
  timestamp: string
  replies: MsgReply[]
}

// ─── Sample data ─────────────────────────────────────────────────────────────
const initialInbox: Msg[] = [
  {
    id: '1', fromId: 'u1', fromName: 'د. أحمد محمد', toId: 'me', toName: 'أنا',
    subject: 'تحديث حالة المريض - غرفة 302',
    content: 'مرحباً، أرجو مراجعة حالة المريض في الغرفة 302. هناك تغير في العلامات الحيوية يحتاج متابعة. الرجاء التأكد من قياس الضغط كل ساعة وإبلاغي بأي تغيرات.',
    priority: 'high', read: false, starred: false, archived: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    replies: [],
  },
  {
    id: '2', fromId: 'u3', fromName: 'فاطمة علي', toId: 'me', toName: 'أنا',
    subject: 'طلب تبديل مناوبة',
    content: 'السلام عليكم، هل يمكنني تبديل مناوبة يوم الخميس القادم؟ لدي موعد طبي مهم. أستطيع تعويضها يوم السبت.',
    priority: 'normal', read: true, starred: false, archived: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    replies: [
      { id: 'r1', fromName: 'أنا', content: 'بالتأكيد، تم قبول الطلب. يُرجى التنسيق مع المشرف.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    ],
  },
  {
    id: '3', fromId: 'u4', fromName: 'إدارة التمريض', toId: 'me', toName: 'أنا',
    subject: 'اجتماع طاقم التمريض - تذكير',
    content: 'تذكير بالاجتماع الشهري لطاقم التمريض يوم الأحد القادم الساعة 2 ظهراً في قاعة الاجتماعات الرئيسية. الحضور إلزامي.',
    priority: 'urgent', read: false, starred: true, archived: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    replies: [],
  },
  {
    id: '4', fromId: 'u5', fromName: 'قسم الصيدلية', toId: 'me', toName: 'أنا',
    subject: 'تأكيد طلب الأدوية',
    content: 'تم استلام طلب الأدوية الخاص بقسم الطابق الثالث. سيتم توصيلها خلال ساعة.',
    priority: 'normal', read: true, starred: false, archived: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    replies: [],
  },
]

const initialSent: Msg[] = [
  {
    id: '5', fromId: 'me', fromName: 'أنا', toId: 'u1', toName: 'د. أحمد محمد',
    subject: 'تقرير المريض - غرفة 301',
    content: 'تم الانتهاء من تقرير المريض المطلوب. العلامات الحيوية مستقرة والحالة تتحسن.',
    priority: 'normal', read: true, starred: false, archived: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    replies: [],
  },
]

const staffList = [
  { id: 'u1', name: 'د. أحمد محمد', role: 'طبيب' },
  { id: 'u3', name: 'فاطمة علي', role: 'ممرضة' },
  { id: 'u4', name: 'محمد حسن', role: 'مشرف' },
  { id: 'u5', name: 'نورة أحمد', role: 'ممرضة' },
  { id: 'u6', name: 'خالد عبدالله', role: 'فني' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts: string) {
  const date = new Date(ts)
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 1) return 'الآن'
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `منذ ${diffH} ساعة`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'أمس'
  if (diffD < 7) return `منذ ${diffD} أيام`
  return date.toLocaleDateString('ar-EG')
}

function priorityBadge(p: Priority) {
  if (p === 'urgent') return <Badge variant="destructive" className="text-xs shrink-0">عاجل</Badge>
  if (p === 'high') return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs shrink-0">مهم</Badge>
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const [waOpen, setWaOpen] = React.useState(false)
  const [inbox, setInbox] = useState<Msg[]>(initialInbox)
  const [sent, setSent] = useState<Msg[]>(initialSent)
  const [selected, setSelected] = useState<Msg | null>(null)
  const [activeTab, setActiveTab] = useState('inbox')
  const [search, setSearch] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const replyRef = useRef<HTMLTextAreaElement>(null)

  const [newMsg, setNewMsg] = useState({ to: '', subject: '', content: '', priority: 'normal' as Priority })

  // Mark as read when selected
  useEffect(() => {
    if (!selected) return
    setInbox(prev => prev.map(m => m.id === selected.id ? { ...m, read: true } : m))
    setSent(prev => prev.map(m => m.id === selected.id ? { ...m, read: true } : m))
  }, [selected?.id])

  const currentList = activeTab === 'inbox'
    ? inbox.filter(m => !m.archived)
    : activeTab === 'sent'
    ? sent.filter(m => !m.archived)
    : [...inbox, ...sent].filter(m => m.archived)

  const filtered = currentList.filter(m =>
    m.subject.includes(search) || m.fromName.includes(search) ||
    m.toName.includes(search) || m.content.includes(search)
  )

  const unreadCount = inbox.filter(m => !m.read && !m.archived).length

  function handleSend() {
    if (!newMsg.to || !newMsg.subject || !newMsg.content) return
    const staff = staffList.find(s => s.id === newMsg.to)
    const msg: Msg = {
      id: Date.now().toString(), fromId: 'me', fromName: 'أنا',
      toId: newMsg.to, toName: staff?.name || '',
      subject: newMsg.subject, content: newMsg.content,
      priority: newMsg.priority, read: false, starred: false, archived: false,
      timestamp: new Date().toISOString(), replies: [],
    }
    setSent(prev => [msg, ...prev])
    setComposeOpen(false)
    setNewMsg({ to: '', subject: '', content: '', priority: 'normal' })
    setActiveTab('sent')
    setSelected(msg)
  }

  function handleReply() {
    if (!selected || !replyText.trim()) return
    setReplyLoading(true)
    const reply: MsgReply = {
      id: Date.now().toString(),
      fromName: 'أنا',
      content: replyText.trim(),
      timestamp: new Date().toISOString(),
    }
    setTimeout(() => {
      const update = (list: Msg[]) => list.map(m =>
        m.id === selected.id ? { ...m, replies: [...m.replies, reply] } : m
      )
      setInbox(update)
      setSent(update)
      setSelected(prev => prev ? { ...prev, replies: [...prev.replies, reply] } : prev)
      setReplyText('')
      setReplyLoading(false)
    }, 400)
  }

  function toggleStar(id: string) {
    const update = (list: Msg[]) => list.map(m => m.id === id ? { ...m, starred: !m.starred } : m)
    setInbox(update); setSent(update)
    setSelected(prev => prev?.id === id ? { ...prev, starred: !prev.starred } : prev)
  }

  function archiveMsg(id: string) {
    const update = (list: Msg[]) => list.map(m => m.id === id ? { ...m, archived: true } : m)
    setInbox(update); setSent(update)
    if (selected?.id === id) setSelected(null)
  }

  function deleteMsg(id: string) {
    setInbox(prev => prev.filter(m => m.id !== id))
    setSent(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  function handlePrint() {
    if (!selected) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html dir="rtl"><head><meta charset="utf-8"><title>${selected.subject}</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;direction:rtl}h2{color:#0d9488}hr{margin:16px 0}.reply{background:#f5f5f5;border-radius:8px;padding:12px;margin-top:12px}.meta{color:#666;font-size:13px}</style>
      </head><body>
      <h2>${selected.subject}</h2>
      <p class="meta">من: ${selected.fromName} &nbsp;|&nbsp; إلى: ${selected.toName} &nbsp;|&nbsp; ${new Date(selected.timestamp).toLocaleString('ar-EG')}</p>
      <hr/>
      <p>${selected.content.replace(/\n/g, '<br/>')}</p>
      ${selected.replies.length > 0 ? `<hr/><h4>الردود</h4>${selected.replies.map(r => `<div class="reply"><strong>${r.fromName}</strong> <span class="meta">${new Date(r.timestamp).toLocaleString('ar-EG')}</span><p>${r.content.replace(/\n/g, '<br/>')}</p></div>`).join('')}` : ''}
      <script>window.print();window.close();</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            الرسائل
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
          </h1>
          <p className="text-muted-foreground text-sm">التواصل الداخلي بين أفراد الطاقم الطبي</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 ml-2" />{isAr ? 'رسالة جديدة' : 'New Message'}</Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>إرسال رسالة جديدة</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>إلى</Label>
                <Select value={newMsg.to} onValueChange={v => setNewMsg({ ...newMsg, to: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر المستلم" /></SelectTrigger>
                  <SelectContent>
                    {staffList.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} — {s.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>الأولوية</Label>
                  <Select value={newMsg.priority} onValueChange={v => setNewMsg({ ...newMsg, priority: v as Priority })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="high">مهم</SelectItem>
                      <SelectItem value="urgent">عاجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>الموضوع</Label>
                  <Input value={newMsg.subject} onChange={e => setNewMsg({ ...newMsg, subject: e.target.value })} placeholder="موضوع الرسالة" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>الرسالة</Label>
                <Textarea value={newMsg.content} onChange={e => setNewMsg({ ...newMsg, content: e.target.value })} placeholder="اكتب رسالتك هنا..." rows={5} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setComposeOpen(false)}>إلغاء</Button>
                <Button onClick={handleSend} disabled={!newMsg.to || !newMsg.subject || !newMsg.content}>
                  <Send className="h-4 w-4 ml-2" />إرسال
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          <Button onClick={() => setWaOpen(true)} className="bg-green-600 hover:bg-green-700 gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.764.463 3.422 1.27 4.865L2 22l5.27-1.25A9.935 9.935 0 0012 22c5.523 0 10-4.477 10-10S17.522 2 12 2zm0 18a7.96 7.96 0 01-4.073-1.115l-.292-.173-3.027.716.754-2.943-.19-.302A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
            {isAr ? 'واتساب' : 'WhatsApp'}
          </Button>
        </div>
        <WhatsAppSendDialog open={waOpen} onClose={() => setWaOpen(false)} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'رسائل واردة', value: inbox.filter(m => !m.archived).length, icon: <Inbox className="h-4 w-4" />, color: 'text-primary bg-primary/10' },
          { label: 'غير مقروءة', value: unreadCount, icon: <AlertCircle className="h-4 w-4" />, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20' },
          { label: 'رسائل مرسلة', value: sent.filter(m => !m.archived).length, icon: <SendHorizontal className="h-4 w-4" />, color: 'text-green-600 bg-green-100 dark:bg-green-900/20' },
          { label: 'عاجلة', value: inbox.filter(m => m.priority === 'urgent' && !m.archived).length, icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-600 bg-red-100 dark:bg-red-900/20' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', s.color)}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List panel */}
        <Card className="lg:col-span-1 flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={t => { setActiveTab(t); setSelected(null) }} className="flex-1 flex flex-col">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b h-9">
              <TabsTrigger value="inbox" className="gap-1 text-xs">
                <Inbox className="h-3.5 w-3.5" />الوارد
                {unreadCount > 0 && <Badge variant="destructive" className="h-4 px-1 text-[10px]">{unreadCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-1 text-xs">
                <SendHorizontal className="h-3.5 w-3.5" />المرسل
              </TabsTrigger>
              <TabsTrigger value="archived" className="gap-1 text-xs">
                <Archive className="h-3.5 w-3.5" />الأرشيف
              </TabsTrigger>
            </TabsList>
            {['inbox', 'sent', 'archived'].map(tab => (
              <TabsContent key={tab} value={tab} className="m-0 flex-1">
                <div className="divide-y max-h-[480px] overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">لا توجد رسائل</p>
                    </div>
                  ) : filtered.map(msg => (
                    <button
                      key={msg.id}
                      onClick={() => setSelected(msg)}
                      className={cn(
                        'w-full p-3 text-right hover:bg-muted/50 transition-colors border-b last:border-0',
                        !msg.read && 'bg-primary/5',
                        selected?.id === msg.id && 'bg-muted'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {(tab === 'sent' ? msg.toName : msg.fromName).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center justify-between gap-1">
                            <span className={cn('text-sm truncate', !msg.read && 'font-bold')}>
                              {tab === 'sent' ? msg.toName : msg.fromName}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(msg.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {priorityBadge(msg.priority)}
                            <p className="text-xs truncate text-muted-foreground">{msg.subject}</p>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{msg.content}</p>
                          {msg.replies.length > 0 && (
                            <span className="text-[10px] text-primary flex items-center gap-0.5 mt-0.5">
                              <Reply className="h-2.5 w-2.5" />{msg.replies.length} رد
                            </span>
                          )}
                        </div>
                        {!msg.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        {/* Detail panel */}
        <Card className="lg:col-span-2 flex flex-col">
          {selected ? (
            <div className="flex flex-col h-full">
              {/* Message header */}
              <div className="p-4 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">{selected.subject}</h3>
                      {priorityBadge(selected.priority)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span>من: <strong className="text-foreground">{selected.fromName}</strong></span>
                      <span>إلى: <strong className="text-foreground">{selected.toName}</strong></span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(selected.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStar(selected.id)} title="تمييز">
                      <Star className={cn('h-4 w-4', selected.starred && 'fill-amber-400 text-amber-400')} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrint} title="طباعة">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => archiveMsg(selected.id)} title="أرشفة">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMsg(selected.id)} title="حذف">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Conversation thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px]">
                {/* Original message */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selected.fromName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{selected.fromName}</span>
                      <span className="text-xs text-muted-foreground">{new Date(selected.timestamp).toLocaleString('ar-EG')}</span>
                    </div>
                    <div className="bg-muted/50 rounded-xl rounded-tr-sm p-3 text-sm leading-relaxed">
                      {selected.content}
                    </div>
                  </div>
                </div>

                {/* Replies thread */}
                {selected.replies.map(r => (
                  <div key={r.id} className={cn('flex items-start gap-3', r.fromName === 'أنا' && 'flex-row-reverse')}>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className={cn('text-sm', r.fromName === 'أنا' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        {r.fromName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('flex-1', r.fromName === 'أنا' && 'text-left')}>
                      <div className={cn('flex items-center gap-2 mb-1', r.fromName === 'أنا' && 'flex-row-reverse')}>
                        <span className="font-medium text-sm">{r.fromName}</span>
                        <span className="text-xs text-muted-foreground">{new Date(r.timestamp).toLocaleString('ar-EG')}</span>
                      </div>
                      <div className={cn(
                        'rounded-xl p-3 text-sm leading-relaxed',
                        r.fromName === 'أنا'
                          ? 'bg-primary text-primary-foreground rounded-tl-sm'
                          : 'bg-muted/50 rounded-tr-sm'
                      )}>
                        {r.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              {activeTab !== 'archived' && (
                <div className="p-4 border-t bg-muted/20">
                  <div className="flex gap-2 items-end">
                    <Textarea
                      ref={replyRef}
                      placeholder={`الرد على ${selected.fromName}...`}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply() }}
                      rows={2}
                      className="flex-1 resize-none text-sm"
                    />
                    <Button
                      onClick={handleReply}
                      disabled={!replyText.trim() || replyLoading}
                      size="sm"
                      className="shrink-0"
                    >
                      {replyLoading ? (
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <><Reply className="h-4 w-4 ml-1" />إرسال الرد</>
                      )}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Ctrl+Enter للإرسال السريع</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-base font-medium">اختر رسالة للقراءة</p>
              <p className="text-sm mt-1">أو أنشئ رسالة جديدة من الزر أعلاه</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
