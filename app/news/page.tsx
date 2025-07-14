'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Newspaper
} from 'lucide-react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { News } from '@/lib/types';
import { cn } from '@/lib/utils';

// Mock data - replace with actual API calls
const mockNews: News[] = [
  {
    id: '1',
    title: 'Nuevas Herramientas de Seguridad Implementadas',
    content: 'Hemos implementado nuevas herramientas de seguridad para garantizar la protección de nuestros técnicos en campo. Estas incluyen nuevos equipos de protección personal y protocolos actualizados.',
    summary: 'Implementación de nuevas herramientas de seguridad para técnicos.',
    imageUrl: 'https://images.pexels.com/photos/1161547/pexels-photo-1161547.jpeg?auto=compress&cs=tinysrgb&w=800',
    authorId: 'admin-1',
    authorName: 'María González',
    publishedAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    likes: ['user-1', 'user-2', 'user-3'],
    comments: [
      {
        id: 'c1',
        authorId: 'user-1',
        authorName: 'Juan Pérez',
        content: 'Excelente iniciativa para nuestra seguridad.',
        createdAt: '2024-01-15T15:00:00Z'
      }
    ],
    tags: ['seguridad', 'herramientas', 'protección'],
    isPublished: true
  },
  {
    id: '2',
    title: 'Capacitación en Nuevas Tecnologías',
    content: 'El próximo mes comenzaremos un programa de capacitación en nuevas tecnologías IoT para el mantenimiento de equipos domésticos. La capacitación será obligatoria para todos los técnicos.',
    summary: 'Programa de capacitación en tecnologías IoT para técnicos.',
    imageUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
    authorId: 'supervisor-1',
    authorName: 'Carlos Rodríguez',
    publishedAt: '2024-01-14T10:15:00Z',
    updatedAt: '2024-01-14T10:15:00Z',
    likes: ['user-2', 'user-4'],
    comments: [],
    tags: ['capacitación', 'tecnología', 'IoT'],
    isPublished: true
  },
  {
    id: '3',
    title: 'Actualización de Protocolos de Emergencia',
    content: 'Se han actualizado los protocolos de emergencia para situaciones de alto riesgo. Todos los empleados deben revisar la nueva documentación disponible en el portal interno.',
    summary: 'Actualización de protocolos de emergencia para situaciones de alto riesgo.',
    authorId: 'admin-1',
    authorName: 'María González',
    publishedAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
    likes: ['user-1', 'user-3', 'user-5', 'user-6'],
    comments: [
      {
        id: 'c2',
        authorId: 'user-3',
        authorName: 'Ana López',
        content: 'Es importante mantenernos actualizados con estos protocolos.',
        createdAt: '2024-01-13T17:00:00Z'
      },
      {
        id: 'c3',
        authorId: 'user-5',
        authorName: 'Pedro Martín',
        content: '¿Cuándo estará disponible la documentación completa?',
        createdAt: '2024-01-13T17:30:00Z'
      }
    ],
    tags: ['protocolos', 'emergencia', 'seguridad'],
    isPublished: true
  }
];

const fetchNews = async (): Promise<News[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockNews;
};

interface NewsCardProps {
  news: News;
  onClick: () => void;
}

function NewsCard({ news, onClick }: NewsCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(news.likes.length);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    // Here you would typically make an API call to update the like status
    console.log('Toggle like for news:', news.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: window.location.href + '/' + news.id
      });
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href + '/' + news.id);
      // You could show a toast notification here
    }
  };

  return (
    <article
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {news.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <User size={16} />
          <span>{news.authorName}</span>
          <span>•</span>
          <Calendar size={16} />
          <span>{formatDate(news.publishedAt)}</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {news.title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {news.summary}
        </p>

        <div className="flex items-center flex-wrap gap-2 mb-4">
          {news.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center space-x-1 text-sm transition-colors',
                isLiked ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              )}
            >
              <Heart size={16} className={isLiked ? 'fill-current' : ''} />
              <span>{likesCount}</span>
            </button>

            <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <MessageCircle size={16} />
              <span>{news.comments.length}</span>
            </button>

            <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <Eye size={16} />
              <span>Ver</span>
            </button>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Share2 size={16} />
            <span>Compartir</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function NewsContent() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
  });

  const filteredNews = news?.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleNewsClick = (newsId: string) => {
    // Navigate to news detail
    console.log('Navigate to news:', newsId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando noticias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Noticias y Anuncios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mantente al día con las últimas novedades de la empresa
          </p>
        </div>
        
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus size={20} />
          <span>Nueva Noticia</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Buscar noticias, etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            <Filter size={16} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredNews.map((newsItem) => (
          <NewsCard
            key={newsItem.id}
            news={newsItem}
            onClick={() => handleNewsClick(newsItem.id)}
          />
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay noticias</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? 'No se encontraron noticias con el término de búsqueda.'
              : 'No hay noticias publicadas en este momento.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default function NewsPage() {
  return (
    <ProtectedLayout>
      <NewsContent />
    </ProtectedLayout>
  );
}