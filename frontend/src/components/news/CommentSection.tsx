import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Comment } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  ThumbsUp, ThumbsDown, MessageSquare, Send, User, Trash2,
  Pin, Ban, Flag, Loader2, Upload, Link as LinkIcon, X,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  apiGetComments, apiPostComment, apiVoteComment,
  apiDeleteComment, apiUpdateComment, apiUploadFile,
} from '../../lib/api';

interface CommentSectionProps {
  articleId: string;
}

interface ApiComment {
  id: number;
  article_id: number;
  author_name: string;
  author_id: string | null;
  author_avatar: string | null;
  is_anonymous: number;
  content: string;
  votes: number;
  is_spam: number;
  is_featured: number;
  parent_id: number | null;
  created_at: string;
  replies?: ApiComment[];
}

function apiCommentToComment(c: ApiComment): Comment {
  return {
    id:           String(c.id),
    articleId:    String(c.article_id),
    author:       c.author_name,
    authorId:     c.author_id ?? undefined,
    authorAvatar: c.author_avatar ?? undefined,
    isAnonymous:  Boolean(c.is_anonymous),
    content:      c.content,
    date:         new Date(c.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
    votes:      c.votes,
    isSpam:     Boolean(c.is_spam),
    isFeatured: Boolean(c.is_featured),
    replies:    c.replies?.map(apiCommentToComment) ?? [],
  };
}

// ── Reply form — fully self-contained, stable identity ────────────────────────
interface ReplyFormProps {
  parentAuthor: string;
  articleId: string;
  parentId: string;
  authorName: string;
  authorAvatar: string;
  onCancel: () => void;
  onPosted: () => void;
}

function ReplyForm({
  parentAuthor, articleId, parentId,
  authorName, authorAvatar, onCancel, onPosted,
}: ReplyFormProps) {
  const [text, setText]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await apiPostComment({
        article_id:   Number(articleId),
        author_name:  authorName || 'Guest',
        author_email: '',
        content:      text.trim(),
        parent_id:    Number(parentId),
      });
      setText('');
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-3 overflow-hidden"
    >
      <form onSubmit={handleSubmit}>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex gap-3">
          {/* Mini avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-vibrant-primary/10 flex items-center justify-center shrink-0">
            {authorAvatar
              ? <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
              : <User className="w-4 h-4 text-vibrant-primary" />
            }
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Replying to ${parentAuthor}…`}
              rows={2}
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-vibrant-text dark:text-white resize-none p-0 min-h-[52px]"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="flex items-center gap-1.5 px-5 py-1.5 bg-vibrant-primary text-white text-xs font-bold rounded-full shadow-lg shadow-vibrant-primary/20 disabled:opacity-50 transition-all"
              >
                {submitting
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <><Send className="w-3.5 h-3.5" /> Reply</>
                }
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

// ── CommentItem — defined OUTSIDE parent so identity is stable ────────────────
interface CommentItemProps {
  comment: Comment;
  depth?: number;
  articleId: string;
  authorName: string;
  authorAvatar: string;
  canModerate: boolean;
  isAdmin: boolean;
  bannedUserIds: string[];
  onVote: (id: string, dir: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onToggleSpam: (id: string, current: boolean) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  banUser: (id: string) => void;
  unbanUser: (id: string) => void;
  onReplyPosted: () => void;
}

function CommentItem({
  comment, depth = 0, articleId,
  authorName, authorAvatar,
  canModerate, isAdmin, bannedUserIds,
  onVote, onDelete, onToggleSpam, onToggleFeatured,
  banUser, unbanUser, onReplyPosted,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const isBanned = comment.authorId ? bannedUserIds.includes(comment.authorId) : false;
  if (comment.isSpam && !canModerate) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'flex flex-col gap-2 p-4 rounded-xl transition-colors',
        depth > 0 && 'mt-3 ml-8 md:ml-12 border-l-2 border-gray-100 dark:border-white/5 pl-6',
        comment.isFeatured && 'bg-vibrant-primary/5 border border-vibrant-primary/20',
        comment.isSpam && 'opacity-50 grayscale bg-red-50 dark:bg-red-950/20',
      )}
    >
      <div className="group flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 relative">
          {comment.authorAvatar && !comment.isAnonymous ? (
            <img
              src={comment.authorAvatar}
              alt={comment.author}
              className={cn('rounded-xl object-cover shadow-lg',
                depth === 0 ? 'w-12 h-12' : 'w-9 h-9')}
            />
          ) : (
            <div className={cn(
              'rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black shadow-lg',
              comment.isFeatured
                ? 'from-vibrant-accent to-vibrant-primary'
                : 'from-vibrant-primary to-vibrant-primary-dark',
              depth === 0 ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm',
            )}>
              {comment.isAnonymous ? '?' : comment.author.charAt(0).toUpperCase()}
            </div>
          )}
          {comment.isFeatured && (
            <div className="absolute -top-2 -right-2 bg-vibrant-accent text-white p-1 rounded-full shadow-md">
              <Pin className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('font-bold text-vibrant-text dark:text-white',
                depth > 0 ? 'text-sm' : 'text-base')}>
                {comment.author}
                {isBanned && (
                  <span className="ml-2 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded uppercase">
                    Banned
                  </span>
                )}
              </span>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <span className="text-xs text-gray-400">{comment.date}</span>
              {comment.isSpam && (
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">[SPAM]</span>
              )}
            </div>

            {/* Moderation actions */}
            {canModerate && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleFeatured(comment.id, !!comment.isFeatured)}
                  className={cn('p-2 rounded-full transition-all',
                    comment.isFeatured
                      ? 'text-vibrant-accent bg-vibrant-accent/10'
                      : 'text-gray-400 hover:text-vibrant-accent hover:bg-vibrant-accent/10')}
                  title="Feature">
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onToggleSpam(comment.id, !!comment.isSpam)}
                  className={cn('p-2 rounded-full transition-all',
                    comment.isSpam
                      ? 'text-red-500 bg-red-500/10'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10')}
                  title="Spam">
                  <Flag className="w-4 h-4" />
                </button>
                {isAdmin && comment.authorId && (
                  <button
                    onClick={() => isBanned ? unbanUser(comment.authorId!) : banUser(comment.authorId!)}
                    className={cn('p-2 rounded-full transition-all',
                      isBanned
                        ? 'text-red-600 bg-red-600/20'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-600/10')}
                    title={isBanned ? 'Unban' : 'Ban'}>
                    <Ban className="w-4 h-4" />
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
                    title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <p className={cn('text-gray-600 dark:text-gray-300 leading-relaxed',
            depth > 0 ? 'text-sm' : 'text-[15px]',
            isBanned && 'italic opacity-50')}>
            {isBanned ? 'This content is hidden because the user is banned.' : comment.content}
          </p>

          {/* Actions row */}
          <div className="flex items-center gap-5 mt-1">
            {/* Votes */}
            <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-full px-2 py-1 gap-1">
              <button onClick={() => onVote(comment.id, 'up')}
                className="p-1.5 hover:text-vibrant-primary transition-colors rounded-full">
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black min-w-[20px] text-center text-vibrant-text dark:text-white">
                {comment.votes}
              </span>
              <button onClick={() => onVote(comment.id, 'down')}
                className="p-1.5 hover:text-red-500 transition-colors rounded-full">
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reply toggle */}
            <button
              onClick={() => setReplyOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-bold transition-colors uppercase tracking-widest',
                replyOpen ? 'text-vibrant-primary' : 'text-gray-400 hover:text-vibrant-primary',
              )}>
              <MessageSquare className="w-3.5 h-3.5" />
              {replyOpen ? 'Close' : 'Reply'}
            </button>
          </div>

          {/* Inline reply form */}
          <AnimatePresence>
            {replyOpen && (
              <ReplyForm
                key={`reply-${comment.id}`}
                parentAuthor={comment.author}
                articleId={articleId}
                parentId={comment.id}
                authorName={authorName}
                authorAvatar={authorAvatar}
                onCancel={() => setReplyOpen(false)}
                onPosted={() => { setReplyOpen(false); onReplyPosted(); }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col mt-1">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              articleId={articleId}
              authorName={authorName}
              authorAvatar={authorAvatar}
              canModerate={canModerate}
              isAdmin={isAdmin}
              bannedUserIds={bannedUserIds}
              onVote={onVote}
              onDelete={onDelete}
              onToggleSpam={onToggleSpam}
              onToggleFeatured={onToggleFeatured}
              banUser={banUser}
              unbanUser={unbanUser}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Main CommentSection ───────────────────────────────────────────────────────
export default function CommentSection({ articleId }: CommentSectionProps) {
  const { isAdmin, isStaff, banUser, unbanUser, bannedUserIds } = useAppContext();
  const canModerate = isAdmin || isStaff;

  const [comments, setComments]           = useState<Comment[]>([]);
  const [loading, setLoading]             = useState(true);
  const [newComment, setNewComment]       = useState('');
  const [authorName, setAuthorName]       = useState('');
  const [authorEmail, setAuthorEmail]     = useState('');
  const [authorAvatar, setAuthorAvatar]   = useState('');
  const [avatarMode, setAvatarMode]       = useState<'url' | 'upload'>('url');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isAnonymous, setIsAnonymous]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [formError, setFormError]         = useState('');
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setAuthorAvatar(localUrl);
    setAvatarUploading(true);
    try {
      const res = await apiUploadFile(file, 'comment_avatar');
      setAuthorAvatar(res.url);
    } catch {
      // keep local blob as preview fallback
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Load comments ────────────────────────────────────────────────────────────
  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetComments(Number(articleId)) as ApiComment[];
      setComments(data.map(apiCommentToComment));
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  // ── Post top-level comment ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAnonymous && !authorName.trim()) { setFormError('Full name is required.'); return; }
    if (!isAnonymous && !authorEmail.trim()) { setFormError('Email address is required.'); return; }
    if (!isAnonymous && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      setFormError('Please enter a valid email address.'); return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      await apiPostComment({
        article_id:    Number(articleId),
        author_name:   isAnonymous ? 'Anonymous' : authorName.trim(),
        author_email:  isAnonymous ? '' : authorEmail.trim(),
        author_avatar: isAnonymous ? '' : authorAvatar.trim(),
        is_anonymous:  isAnonymous,
        content:       newComment.trim(),
      });
      setNewComment('');
      await loadComments();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Moderation handlers ──────────────────────────────────────────────────────
  const handleVote = async (id: string, direction: 'up' | 'down') => {
    const delta = direction === 'up' ? 1 : -1;
    const update = (list: Comment[]): Comment[] =>
      list.map(c => c.id === id
        ? { ...c, votes: c.votes + delta }
        : { ...c, replies: c.replies ? update(c.replies) : undefined });
    setComments(prev => update(prev));
    try { await apiVoteComment(Number(id), direction); } catch { /* optimistic */ }
  };

  const handleDelete = async (id: string) => {
    const remove = (list: Comment[]): Comment[] =>
      list.filter(c => c.id !== id)
          .map(c => ({ ...c, replies: c.replies ? remove(c.replies) : undefined }));
    setComments(prev => remove(prev));
    try { await apiDeleteComment(Number(id)); } catch { /* optimistic */ }
  };

  const handleToggleSpam = async (id: string, current: boolean) => {
    const update = (list: Comment[]): Comment[] =>
      list.map(c => c.id === id
        ? { ...c, isSpam: !c.isSpam }
        : { ...c, replies: c.replies ? update(c.replies) : undefined });
    setComments(prev => update(prev));
    try { await apiUpdateComment(Number(id), { is_spam: current ? 0 : 1 }); } catch { /* optimistic */ }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const update = (list: Comment[]): Comment[] =>
      list.map(c => c.id === id
        ? { ...c, isFeatured: !c.isFeatured }
        : { ...c, replies: c.replies ? update(c.replies) : undefined });
    setComments(prev => update(prev));
    try { await apiUpdateComment(Number(id), { is_featured: current ? 0 : 1 }); } catch { /* optimistic */ }
  };

  const displayName = isAnonymous ? 'Anonymous' : (authorName.trim() || '');

  return (
    <section className="mt-16 pt-16 border-t border-gray-100 dark:border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 bg-vibrant-primary rounded-full" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-vibrant-text dark:text-white">
            Community Conversation
          </h2>
        </div>
        <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">
          {loading ? '…' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* ── Post comment form ── */}
      <form onSubmit={handleSubmit}
        className="mb-12 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <div className="flex gap-4">
          {/* Avatar preview */}
          <div className="w-10 h-10 rounded-full bg-vibrant-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-white/10">
            {authorAvatar && !isAnonymous
              ? <img src={authorAvatar} alt="avatar" className="w-full h-full object-cover" />
              : <User className="w-5 h-5 text-vibrant-primary" />
            }
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {/* Name + Email */}
            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="Full name *"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-vibrant-primary text-sm text-vibrant-text dark:text-white"
                />
                <input
                  type="email"
                  value={authorEmail}
                  onChange={e => setAuthorEmail(e.target.value)}
                  placeholder="Email address *"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-vibrant-primary text-sm text-vibrant-text dark:text-white"
                />
              </div>
            )}

            {/* Avatar — URL or Upload */}
            {!isAnonymous && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-vibrant-primary/10 flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10">
                    {avatarUploading
                      ? <Loader2 className="w-4 h-4 text-vibrant-primary animate-spin" />
                      : authorAvatar
                        ? <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
                        : <User className="w-4 h-4 text-vibrant-primary" />
                    }
                  </div>
                  <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-0.5 text-xs font-bold">
                    <button type="button"
                      onClick={() => setAvatarMode('url')}
                      className={cn('flex items-center gap-1 px-3 py-1.5 rounded-md transition-all',
                        avatarMode === 'url'
                          ? 'bg-white dark:bg-white/10 text-vibrant-primary shadow-sm'
                          : 'text-gray-400 hover:text-gray-600')}>
                      <LinkIcon className="w-3 h-3" /> URL
                    </button>
                    <button type="button"
                      onClick={() => { setAvatarMode('upload'); avatarFileRef.current?.click(); }}
                      className={cn('flex items-center gap-1 px-3 py-1.5 rounded-md transition-all',
                        avatarMode === 'upload'
                          ? 'bg-white dark:bg-white/10 text-vibrant-primary shadow-sm'
                          : 'text-gray-400 hover:text-gray-600')}>
                      <Upload className="w-3 h-3" /> Upload
                    </button>
                  </div>
                  {authorAvatar && (
                    <button type="button"
                      onClick={() => { setAuthorAvatar(''); if (avatarFileRef.current) avatarFileRef.current.value = ''; }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {avatarMode === 'url' && (
                  <input
                    value={authorAvatar}
                    onChange={e => setAuthorAvatar(e.target.value)}
                    placeholder="Avatar image URL (optional)"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-vibrant-primary text-sm text-vibrant-text dark:text-white"
                  />
                )}
                <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                {avatarMode === 'upload' && !authorAvatar && (
                  <button type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl text-sm text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/5 transition-all border border-dashed border-gray-300 dark:border-white/10">
                    <Upload className="w-4 h-4" /> Click to choose an image
                  </button>
                )}
              </div>
            )}

            {/* Comment textarea */}
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your perspective…"
              className="w-full min-h-[100px] p-4 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-vibrant-primary text-vibrant-text dark:text-white resize-none"
            />

            {formError && <p className="text-sm text-red-500 font-medium">{formError}</p>}

            {/* Anonymous toggle + Submit */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div
                  onClick={() => setIsAnonymous(v => !v)}
                  className={cn('relative w-10 h-5 rounded-full transition-colors duration-200',
                    isAnonymous ? 'bg-vibrant-primary' : 'bg-gray-200 dark:bg-white/10')}>
                  <span className={cn(
                    'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                    isAnonymous && 'translate-x-5')} />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-vibrant-text dark:group-hover:text-white transition-colors">
                  Comment anonymously
                </span>
              </label>

              <button type="submit" disabled={submitting || !newComment.trim()}
                className={cn(
                  'flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-lg',
                  newComment.trim()
                    ? 'bg-vibrant-primary text-white shadow-vibrant-primary/20 hover:scale-105 active:scale-95'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed',
                )}>
                {submitting
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send className="w-4 h-4" /> Post Comment</>
                }
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Comments list ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading comments…</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No comments yet. Be the first to share your thoughts.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                articleId={articleId}
                authorName={displayName}
                authorAvatar={isAnonymous ? '' : authorAvatar}
                canModerate={canModerate}
                isAdmin={isAdmin}
                bannedUserIds={bannedUserIds}
                onVote={handleVote}
                onDelete={handleDelete}
                onToggleSpam={handleToggleSpam}
                onToggleFeatured={handleToggleFeatured}
                banUser={banUser}
                unbanUser={unbanUser}
                onReplyPosted={loadComments}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
