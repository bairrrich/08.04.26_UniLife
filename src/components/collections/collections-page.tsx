'use client'

import { Library, Plus, ArrowUpDown, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { CollectionType, CollectionStatus } from './types'
import type { SortOption } from './constants'
import { TYPE_LABELS, STATUS_LABELS, SORT_OPTIONS, QUICK_ADD_TEMPLATES } from './constants'
import { useCollections } from './hooks'
import { StatsBar } from './stats-bar'
import { ItemCard } from './item-card'
import { AddItemDialog } from './add-item-dialog'
import { ItemDialog } from './item-dialog'

export default function CollectionsPage() {
  const {
    items, loading, activeType, activeStatus, sortBy,
    setActiveType, setActiveStatus, setSortBy,
    searchQuery, setSearchQuery,
    dialogOpen, setDialogOpen, detailItem, detailOpen,
    isEditing, editSaving,
    formType, setFormType, formTitle, setFormTitle,
    formAuthor, setFormAuthor, formDescription, setFormDescription,
    formRating, setFormRating, formStatus, setFormStatus,
    formTags, setFormTags,
    editTitle, editAuthor, editDescription,
    editType, editStatus, editTags,
    editNotes, editRating,
    setEditTitle, setEditAuthor, setEditDescription,
    setEditType, setEditStatus, setEditTags,
    setEditNotes, setEditRating,
    handleSubmit, handleStatusUpdate, handleDelete,
    handleRatingUpdate, openDetail, startEditing,
    handleEditSave, closeDetail, cancelEdit, openQuickAdd,
    totalCount, completedCount, inProgressCount, averageRating,
    typeCounts,
    formNotes, setFormNotes,
  } = useCollections()

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header with decorative gradient blob */}
      <div className="relative">
        <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -top-8 -left-4 w-40 h-40 rounded-full bg-gradient-to-amber-400/15 to-orange-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Library className="h-5 w-5 sm:h-6 sm:w-6" />
              Коллекции
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 truncate">
              Книги, фильмы, рецепты и полезные находки
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="shrink-0 sm:size-default">
            <Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Добавить</span>
          </Button>
          <AddItemDialog
            open={dialogOpen} onOpenChange={setDialogOpen}
            formType={formType} setFormType={setFormType}
            formTitle={formTitle} setFormTitle={setFormTitle}
            formAuthor={formAuthor} setFormAuthor={setFormAuthor}
            formDescription={formDescription} setFormDescription={setFormDescription}
            formRating={formRating} setFormRating={setFormRating}
            formStatus={formStatus} setFormStatus={setFormStatus}
            formTags={formTags} setFormTags={setFormTags}
            formNotes={formNotes} setFormNotes={setFormNotes}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию или автору..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Type Tabs */}
      <Tabs value={activeType} onValueChange={setActiveType}>
        <TabsList className="flex-wrap h-auto gap-1 [&_[data-state=active]]:border-b-2 [&_[data-state=active]]:border-primary [&_[data-state=active]]:shadow-none">
          <TabsTrigger value="all">Все</TabsTrigger>
          {(Object.entries(TYPE_LABELS) as [CollectionType, string][]).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
          ))}
        </TabsList>

        <StatsBar
          loading={loading}
          totalCount={totalCount}
          completedCount={completedCount}
          inProgressCount={inProgressCount}
          averageRating={averageRating}
          typeCounts={typeCounts}
        />

        {/* Quick Add Templates */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {QUICK_ADD_TEMPLATES.map((template) => (
            <Button
              key={template.type}
              variant="ghost"
              size="sm"
              className={`gap-1.5 text-xs font-medium ${template.color} border-0 shadow-sm`}
              onClick={() => openQuickAdd(template.type)}
            >
              {template.icon}
              {template.label}
            </Button>
          ))}
        </div>

        {/* Status filter + Sort */}
        <div className="flex gap-2 mt-4 flex-wrap items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Button variant={activeStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveStatus('all')}>
              Все статусы
            </Button>
            {(Object.entries(STATUS_LABELS) as [CollectionStatus, string][]).map(([key, label]) => (
              <Button key={key} variant={activeStatus === key ? 'default' : 'outline'} size="sm" onClick={() => setActiveStatus(key)}>
                {label}
              </Button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-auto text-xs h-8 min-w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid of items */}
        <TabsContent value={activeType} className="mt-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Cover image placeholder */}
                    <div className="skeleton-shimmer h-32 w-full rounded-none" />
                    {/* Card content */}
                    <div className="p-3 space-y-2">
                      <div className="skeleton-shimmer h-4 rounded w-full" />
                      <div className="skeleton-shimmer h-3 rounded w-2/3" />
                      <div className="flex gap-1">
                        <div className="skeleton-shimmer h-3.5 w-3.5 rounded-sm" />
                        <div className="skeleton-shimmer h-3.5 w-3.5 rounded-sm" />
                        <div className="skeleton-shimmer h-3.5 w-3.5 rounded-sm" />
                        <div className="skeleton-shimmer h-3.5 w-3.5 rounded-sm" />
                        <div className="skeleton-shimmer h-3.5 w-3.5 rounded-sm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card className="overflow-hidden rounded-xl border">
              <CardContent className="relative p-0">
                {/* Subtle gradient card background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5" />
                <div className="relative flex flex-col items-center justify-center py-12 text-center">
                  {/* Gradient icon circle */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-lg shadow-purple-500/25">
                    <Library className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">Коллекция пуста</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto">
                    Добавьте книги, фильмы или рецепты в свою коллекцию
                  </p>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="mt-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить элемент
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} onClick={openDetail} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <ItemDialog
        item={detailItem} open={detailOpen}
        onOpenChange={closeDetail}
        isEditing={isEditing}
        editTitle={editTitle} editAuthor={editAuthor} editDescription={editDescription}
        editType={editType} editStatus={editStatus} editTags={editTags}
        editNotes={editNotes} editRating={editRating} editSaving={editSaving}
        setEditTitle={setEditTitle} setEditAuthor={setEditAuthor}
        setEditDescription={setEditDescription} setEditType={setEditType}
        setEditStatus={setEditStatus} setEditTags={setEditTags}
        setEditNotes={setEditNotes} setEditRating={setEditRating}
        onStartEdit={startEditing} onCancelEdit={cancelEdit}
        onSaveEdit={handleEditSave}
        onStatusUpdate={handleStatusUpdate} onDelete={handleDelete}
        onRatingUpdate={handleRatingUpdate}
      />
    </div>
  )
}
