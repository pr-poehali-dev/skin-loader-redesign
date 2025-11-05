import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

const CANVAS_SIZE = 64;
const PIXEL_SIZE = 8;

const Index = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedColor, setSelectedColor] = useState('#9b87f5');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [skinData, setSkinData] = useState<ImageData | null>(null);

  const exampleSkins = [
    { id: 1, name: 'Steve Classic', author: 'Minecraft', downloads: '1.2M' },
    { id: 2, name: 'Creeper Boy', author: 'CraftMaster', downloads: '856K' },
    { id: 3, name: 'Ender Knight', author: 'PixelArtist', downloads: '623K' },
    { id: 4, name: 'Diamond Warrior', author: 'SkinPro', downloads: '445K' },
    { id: 5, name: 'Neon Ninja', author: 'CyberCraft', downloads: '389K' },
    { id: 6, name: 'Fire Mage', author: 'MagicPixels', downloads: '301K' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(0, 0, CANVAS_SIZE * PIXEL_SIZE, CANVAS_SIZE * PIXEL_SIZE);

    for (let i = 0; i <= CANVAS_SIZE; i++) {
      ctx.strokeStyle = '#3a3a4a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(i * PIXEL_SIZE, 0);
      ctx.lineTo(i * PIXEL_SIZE, CANVAS_SIZE * PIXEL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * PIXEL_SIZE);
      ctx.lineTo(CANVAS_SIZE * PIXEL_SIZE, i * PIXEL_SIZE);
      ctx.stroke();
    }
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = selectedColor;
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    handleCanvasClick(e);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(0, 0, CANVAS_SIZE * PIXEL_SIZE, CANVAS_SIZE * PIXEL_SIZE);

    for (let i = 0; i <= CANVAS_SIZE; i++) {
      ctx.strokeStyle = '#3a3a4a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(i * PIXEL_SIZE, 0);
      ctx.lineTo(i * PIXEL_SIZE, CANVAS_SIZE * PIXEL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * PIXEL_SIZE);
      ctx.lineTo(CANVAS_SIZE * PIXEL_SIZE, i * PIXEL_SIZE);
      ctx.stroke();
    }
  };

  const downloadSkin = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'minecraft-skin.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = [
    '#9b87f5', '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9',
    '#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#000000',
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#8b4513', '#a0522d', '#d2691e', '#cd853f', '#f4a460', '#deb887',
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Paintbrush" className="text-primary-foreground" size={24} />
            </div>
            <h1 className="text-2xl font-bold">SkinLoader</h1>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost" onClick={() => setActiveTab('editor')}>
              <Icon name="Pencil" size={18} className="mr-2" />
              Редактор
            </Button>
            <Button variant="ghost" onClick={() => setActiveTab('library')}>
              <Icon name="Library" size={18} className="mr-2" />
              Библиотека
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="editor" className="animate-fade-in">
            <div className="grid lg:grid-cols-[1fr,400px] gap-8">
              <div>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Пиксельный редактор</h2>
                  <div className="flex justify-center mb-6">
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_SIZE * PIXEL_SIZE}
                      height={CANVAS_SIZE * PIXEL_SIZE}
                      className="border-2 border-border rounded-lg cursor-crosshair shadow-lg"
                      onClick={handleCanvasClick}
                      onMouseDown={() => setIsDrawing(true)}
                      onMouseUp={() => setIsDrawing(false)}
                      onMouseLeave={() => setIsDrawing(false)}
                      onMouseMove={handleMouseMove}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Цвет</label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <div className="flex flex-wrap gap-2 flex-1">
                          {colors.map((color) => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                              style={{ 
                                backgroundColor: color,
                                borderColor: selectedColor === color ? '#9b87f5' : 'transparent'
                              }}
                              onClick={() => setSelectedColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={clearCanvas} variant="outline" className="flex-1">
                        <Icon name="Eraser" size={18} className="mr-2" />
                        Очистить
                      </Button>
                      <Button onClick={downloadSkin} className="flex-1">
                        <Icon name="Download" size={18} className="mr-2" />
                        Скачать
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Превью 3D</h2>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-muted-foreground">
                      <Icon name="Box" size={64} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">3D модель персонажа</p>
                      <p className="text-xs mt-1">с применённым скином</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="MousePointer2" size={16} />
                      <span>ЛКМ - рисовать пиксель</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Hand" size={16} />
                      <span>Зажать и вести - линия</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Palette" size={16} />
                      <span>Выбери цвет из палитры</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Библиотека скинов</h2>
              <p className="text-muted-foreground">Популярные скины от сообщества</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exampleSkins.map((skin) => (
                <Card key={skin.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-scale-in">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                      <Icon name="User" size={48} className="text-primary" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{skin.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">by {skin.author}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Icon name="Download" size={14} />
                        <span>{skin.downloads}</span>
                      </div>
                      <Button size="sm">
                        <Icon name="Download" size={14} className="mr-1" />
                        Скачать
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>SkinLoader - Современный редактор скинов для Minecraft</p>
          <p className="mt-2">Создано с ❤️ для сообщества</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
