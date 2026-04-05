'use client'

import { Library, Plus, Search, LayoutGrid, List, SortAsc, Star, Heart, Clock, CheckCircle } from 'lucide-react'
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
import { TYPE_LABELS, STATUS_LABELS, STATUS_COLORS, SORT_OPTIONS, QUICK_ADD_TEMPLATES, TYPE_ICONS_LARGE, getCoverGradient, formatDaysAgo } from './constants'
import { useCollections } from './hooks'
import { StatsBar } from './stats-bar'
import { ItemCard } from './item-card'
import { AddItemDialog } from './add-item-dialog'
import { ItemDialog } from './item-dialog'
import { cn } from '@/lib/utils'

export default function CollectionsPage() {
  const {
    items, loading, activeType, activeStatus, sortBy,
    setActiveType, setActiveStatus, setSortBy,
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
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
    totalCount, wantCount, completedCount, inProgressCount, averageRating,
    typeCounts,
    formNotes, setFormNotes,
    getRelatedItems,
    favorites, toggleFavorite,
  } = useCollections()

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header with decorative gradient blob */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -top-4 right-20 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-400/10 blur-3xl" />
        <div className="relative flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Коллекции</h1>
              <p className="text-sm text-muted-foreground truncate">
                Книги, фильмы, рецепты и полезные находки
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Добавить</span>
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
          wantCount={wantCount}
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

        {/* Status filter + Sort + View Mode */}
        <div className="flex gap-2 mt-4 flex-wrap items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Button variant={activeStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveStatus('all')}>
              Все статусы
            </Button>
            {(Object.entries(STATUS_LABELS) as [CollectionStatus, string][]).map(([key, label]) => {
              const StatusIcon = key === 'WANT' ? Heart : key === 'IN_PROGRESS' ? Clock : CheckCircle
              return (
                <Button key={key} variant={activeStatus === key ? 'default' : 'outline'} size="sm" onClick={() => setActiveStatus(key)} className="gap-1.5">
                  <StatusIcon className="h-3.5 w-3.5" />
                  {label}
                </Button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-auto text-xs h-8 min-w-[140px]">
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

            {/* Grid/List view toggle */}
            <div className="hidden sm:flex items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
                title="Сетка"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
                title="Список"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
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
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={openDetail}
                    isFavorite={favorites.has(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3 stagger-children">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden cursor-pointer group card-hover"
                    onClick={() => openDetail(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Cover thumbnail */}
                        <div
                          className="h-14 w-14 rounded-lg bg-gradient-to-br shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-[1.05] transition-transform duration-300"
                          style={{ backgroundColor: 'transparent' }}
                        >
                          <div
                            className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${getCoverGradient(item.id)}`}
                          >
                            <div className="text-white/80">
                              {TYPE_ICONS_LARGE[item.type as CollectionType] && (
                                <span className="[&>svg]:h-5 [&>svg]:w-5">{TYPE_ICONS_LARGE[item.type as CollectionType]}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
                            <span
                              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status]}`}
                            >
                              {STATUS_LABELS[item.status]}
                            </span>
                          </div>
                          {item.author && (
                            <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            {item.rating && (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn(
                                    'h-3 w-3 transition-colors',
                                    i < (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
                                  )} />
                                ))}
                              </div>
                            )}
                            <span className="text-[10px] text-muted-foreground">{formatDaysAgo(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
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
        isFavorite={detailItem ? favorites.has(detailItem.id) : false}
        onToggleFavorite={toggleFavorite}
        relatedItems={detailItem ? getRelatedItems(detailItem) : []}
        onOpenRelated={openDetail}
      />
    </div>
  )
}


