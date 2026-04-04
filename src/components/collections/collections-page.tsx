'use client'

import { Library, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { CollectionType, CollectionStatus } from './types'
import { TYPE_LABELS, STATUS_LABELS } from './constants'
import { useCollections } from './hooks'
import { StatsBar } from './stats-bar'
import { ItemCard } from './item-card'
import { AddItemDialog } from './add-item-dialog'
import { ItemDialog } from './item-dialog'

export default function CollectionsPage() {
  const {
    items, loading, activeType, activeStatus,
    setActiveType, setActiveStatus,
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
    handleEditSave, closeDetail, cancelEdit,
    totalCount, completedCount, inProgressCount,
  } = useCollections()

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header with decorative gradient blob */}
      <div className="relative">
        <div className="absolute -top-16 -right-8 w-56 h-56 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -top-8 -left-4 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Library className="h-6 w-6" />
              Коллекции
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Книги, фильмы, рецепты и полезные находки
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Добавить
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
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* Type Tabs */}
      <Tabs value={activeType} onValueChange={setActiveType}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Все</TabsTrigger>
          {(Object.entries(TYPE_LABELS) as [CollectionType, string][]).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
          ))}
        </TabsList>

        <StatsBar loading={loading} totalCount={totalCount} completedCount={completedCount} inProgressCount={inProgressCount} />

        {/* Status filter */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button variant={activeStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveStatus('all')}>
            Все статусы
          </Button>
          {(Object.entries(STATUS_LABELS) as [CollectionStatus, string][]).map(([key, label]) => (
            <Button key={key} variant={activeStatus === key ? 'default' : 'outline'} size="sm" onClick={() => setActiveStatus(key)}>
              {label}
            </Button>
          ))}
        </div>

        {/* Grid of items */}
        <TabsContent value={activeType} className="mt-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-32 bg-muted rounded-t-xl" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Library className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">Пусто</p>
                <p className="text-muted-foreground text-sm mt-1">Добавьте первый элемент в коллекцию</p>
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
