'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, X, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuroraBackground } from '@/components/layout/aurora-background'
import { useTranslations } from '@/i18n/client'

interface Transaction {
  id: string
  orderId: string
  venue: string
  amount: number
  midtransStatus: 'capture' | 'pending' | 'deny' | 'cancel' | 'expire'
  tipsioStatus: 'RECORDED' | 'FAILED' | 'PENDING'
  paymentMethod: string
  staffName: string | null
  createdAt: string
  errorMessage?: string
}

export default function AdminTransactionsPage() {
  const t = useTranslations('admin.transactions')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState('')
  const [midtransFilter, setMidtransFilter] = useState<string>('all')
  const [tipsioFilter, setTipsioFilter] = useState<string>('all')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    // Mock data for development
    setTransactions([
      {
        id: '1',
        orderId: 'TIP-1732950123456',
        venue: 'Cafe Organic Canggu',
        amount: 50000,
        midtransStatus: 'capture',
        tipsioStatus: 'RECORDED',
        paymentMethod: 'GoPay',
        staffName: 'Agung',
        createdAt: '2024-11-30T10:45:00Z'
      },
      {
        id: '2',
        orderId: 'TIP-1732950234567',
        venue: 'Potato Head Beach Club',
        amount: 100000,
        midtransStatus: 'capture',
        tipsioStatus: 'RECORDED',
        paymentMethod: 'Credit Card',
        staffName: 'Wayan',
        createdAt: '2024-11-30T10:42:00Z'
      },
      {
        id: '3',
        orderId: 'TIP-1732950345678',
        venue: 'La Brisa',
        amount: 75000,
        midtransStatus: 'deny',
        tipsioStatus: 'FAILED',
        paymentMethod: 'Credit Card',
        staffName: null,
        createdAt: '2024-11-30T10:40:00Z',
        errorMessage: 'Card declined by issuing bank'
      },
      {
        id: '4',
        orderId: 'TIP-1732950456789',
        venue: 'Revolver Espresso',
        amount: 25000,
        midtransStatus: 'pending',
        tipsioStatus: 'PENDING',
        paymentMethod: 'Bank Transfer',
        staffName: 'Ketut',
        createdAt: '2024-11-30T10:38:00Z'
      },
      {
        id: '5',
        orderId: 'TIP-1732950567890',
        venue: 'Cafe Organic Canggu',
        amount: 30000,
        midtransStatus: 'expire',
        tipsioStatus: 'FAILED',
        paymentMethod: 'QRIS',
        staffName: 'Made',
        createdAt: '2024-11-30T10:30:00Z',
        errorMessage: 'Payment expired after 15 minutes'
      }
    ])
  }


  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.orderId.toLowerCase().includes(search.toLowerCase()) ||
                         tx.venue.toLowerCase().includes(search.toLowerCase())
    const matchesMidtrans = midtransFilter === 'all' || tx.midtransStatus === midtransFilter
    const matchesTipsio = tipsioFilter === 'all' || tx.tipsioStatus === tipsioFilter
    return matchesSearch && matchesMidtrans && matchesTipsio
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'decimal' }).format(amount)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getMidtransStatusBadge = (status: string) => {
    switch (status) {
      case 'capture':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />{t('capture')}</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />{t('pending')}</Badge>
      case 'deny':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />{t('deny')}</Badge>
      case 'cancel':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><X className="w-3 h-3 mr-1" />{t('cancel')}</Badge>
      case 'expire':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30"><Clock className="w-3 h-3 mr-1" />{t('expire')}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTipsioStatusBadge = (status: string) => {
    switch (status) {
      case 'RECORDED':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{t('recorded')}</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{t('pending')}</Badge>
      case 'FAILED':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{t('failed')}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <AuroraBackground>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-heading font-bold text-white">{t('title')}</h1>
            </div>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10"
                />
              </div>
              <Select value={midtransFilter} onValueChange={setMidtransFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-white/10">
                  <SelectValue placeholder={t('midtransStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allMidtrans')}</SelectItem>
                  <SelectItem value="capture">{t('capture')}</SelectItem>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="deny">{t('deny')}</SelectItem>
                  <SelectItem value="expire">{t('expire')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipsioFilter} onValueChange={setTipsioFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-white/10">
                  <SelectValue placeholder={t('tipsioStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTipsio')}</SelectItem>
                  <SelectItem value="RECORDED">{t('recorded')}</SelectItem>
                  <SelectItem value="PENDING">{t('pending')}</SelectItem>
                  <SelectItem value="FAILED">{t('failed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>


          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('totalToday')}</p>
              <p className="text-2xl font-bold text-white">{transactions.length}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('successful')}</p>
              <p className="text-2xl font-bold text-green-400">
                {transactions.filter(t => t.tipsioStatus === 'RECORDED').length}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('pending')}</p>
              <p className="text-2xl font-bold text-yellow-400">
                {transactions.filter(t => t.tipsioStatus === 'PENDING').length}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('failed')}</p>
              <p className="text-2xl font-bold text-red-400">
                {transactions.filter(t => t.tipsioStatus === 'FAILED').length}
              </p>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('time')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('venue')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('amount')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('midtransStatus')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('tipsioStatus')}</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, index) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{formatTime(tx.createdAt)}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white">{tx.venue}</p>
                          {tx.staffName && (
                            <p className="text-sm text-muted-foreground">→ {tx.staffName}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-primary font-medium">Rp {formatCurrency(tx.amount)}</span>
                      </td>
                      <td className="p-4">{getMidtransStatusBadge(tx.midtransStatus)}</td>
                      <td className="p-4">{getTipsioStatusBadge(tx.tipsioStatus)}</td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary hover:text-primary/80"
                        >
                          {t('viewDetails')}
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="glass-heavy border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-heading">{t('transactionDetails')}</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('orderId')}</p>
                  <p className="text-white font-mono text-sm">{selectedTx.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('amount')}</p>
                  <p className="text-primary font-bold">Rp {formatCurrency(selectedTx.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('venue')}</p>
                  <p className="text-white">{selectedTx.venue}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('staff')}</p>
                  <p className="text-white">{selectedTx.staffName || t('pool')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('paymentMethod')}</p>
                  <p className="text-white">{selectedTx.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('time')}</p>
                  <p className="text-white">{new Date(selectedTx.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('midtransStatus')}</p>
                  {getMidtransStatusBadge(selectedTx.midtransStatus)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('tipsioStatus')}</p>
                  {getTipsioStatusBadge(selectedTx.tipsioStatus)}
                </div>
              </div>
              
              {selectedTx.errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">{t('errorMessage')}</p>
                      <p className="text-sm text-red-300">{selectedTx.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AuroraBackground>
  )
}
