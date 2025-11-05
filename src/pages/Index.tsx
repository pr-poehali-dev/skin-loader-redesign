import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const CANVAS_SIZE = 64;
const PIXEL_SIZE = 8;

type Tool = 'pencil' | 'eraser' | 'fill' | 'picker';
type Layer = 'head' | 'body' | 'rightArm' | 'leftArm' | 'rightLeg' | 'leftLeg' | 'all';

const Index = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedColor, setSelectedColor] = useState('#9b87f5');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pencil');
  const [brushSize, setBrushSize] = useState(1);
  const [selectedLayer, setSelectedLayer] = useState<Layer>('all');
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exampleSkins = [
    { id: 1, name: 'Steve Classic', author: 'Minecraft', downloads: '1.2M' },
    { id: 2, name: 'Creeper Boy', author: 'CraftMaster', downloads: '856K' },
    { id: 3, name: 'Ender Knight', author: 'PixelArtist', downloads: '623K' },
    { id: 4, name: 'Diamond Warrior', author: 'SkinPro', downloads: '445K' },
    { id: 5, name: 'Neon Ninja', author: 'CyberCraft', downloads: '389K' },
    { id: 6, name: 'Fire Mage', author: 'MagicPixels', downloads: '301K' },
  ];

  useEffect(() => {
    initializeCanvas();
  }, [showGrid]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(0, 0, CANVAS_SIZE * PIXEL_SIZE, CANVAS_SIZE * PIXEL_SIZE);

    if (showGrid) {
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
    }
  };

  const drawPixel = (x: number, y: number, color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let i = 0; i < brushSize; i++) {
      for (let j = 0; j < brushSize; j++) {
        const px = x + i;
        const py = y + j;
        if (px >= 0 && px < CANVAS_SIZE && py >= 0 && py < CANVAS_SIZE) {
          ctx.fillStyle = color;
          ctx.fillRect(px * PIXEL_SIZE, py * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    }
  };

  const getPixelColor = (x: number, y: number): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '#000000';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#000000';

    const pixel = ctx.getImageData(x * PIXEL_SIZE + 1, y * PIXEL_SIZE + 1, 1, 1).data;
    return `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetColor = getPixelColor(startX, startY);
    if (targetColor === fillColor) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE) continue;
      if (getPixelColor(x, y) !== targetColor) continue;

      visited.add(key);
      drawPixel(x, y, fillColor);

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

    if (x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE) return;

    switch (currentTool) {
      case 'pencil':
        drawPixel(x, y, selectedColor);
        break;
      case 'eraser':
        drawPixel(x, y, '#2a2a3a');
        break;
      case 'fill':
        floodFill(x, y, selectedColor);
        break;
      case 'picker':
        const color = getPixelColor(x, y);
        setSelectedColor(color);
        setCurrentTool('pencil');
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (currentTool !== 'pencil' && currentTool !== 'eraser')) return;
    handleCanvasClick(e);
  };

  const clearCanvas = () => {
    initializeCanvas();
  };

  const downloadSkin = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'minecraft-skin.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const uploadSkin = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_SIZE * PIXEL_SIZE, CANVAS_SIZE * PIXEL_SIZE);
        ctx.drawImage(img, 0, 0, CANVAS_SIZE * PIXEL_SIZE, CANVAS_SIZE * PIXEL_SIZE);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const colors = [
    '#9b87f5', '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9',
    '#ffffff', '#e5e5e5', '#cccccc', '#999999', '#666666', '#333333', '#000000',
    '#ff0000', '#ff6600', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3',
    '#8b4513', '#a0522d', '#d2691e', '#cd853f', '#f4a460', '#deb887',
    '#ff69b4', '#ff1493', '#c71585', '#db7093', '#ffc0cb',
  ];

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: 'pencil', icon: 'Pencil', label: 'Карандаш' },
    { id: 'eraser', icon: 'Eraser', label: 'Ластик' },
    { id: 'fill', icon: 'PaintBucket', label: 'Заливка' },
    { id: 'picker', icon: 'Pipette', label: 'Пипетка' },
  ];

  const layers: { id: Layer; label: string }[] = [
    { id: 'all', label: 'Все слои' },
    { id: 'head', label: 'Голова' },
    { id: 'body', label: 'Тело' },
    { id: 'rightArm', label: 'Правая рука' },
    { id: 'leftArm', label: 'Левая рука' },
    { id: 'rightLeg', label: 'Правая нога' },
    { id: 'leftLeg', label: 'Левая нога' },
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
            <div className="grid lg:grid-cols-[300px,1fr,350px] gap-6">
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Инструменты</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => (
                      <Button
                        key={tool.id}
                        variant={currentTool === tool.id ? 'default' : 'outline'}
                        className="h-auto py-3 flex flex-col gap-1"
                        onClick={() => setCurrentTool(tool.id)}
                      >
                        <Icon name={tool.icon as any} size={20} />
                        <span className="text-xs">{tool.label}</span>
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Размер кисти</h3>
                  <div className="space-y-2">
                    <Slider
                      value={[brushSize]}
                      onValueChange={(v) => setBrushSize(v[0])}
                      min={1}
                      max={8}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground">{brushSize}px</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Слои</h3>
                  <div className="space-y-1">
                    {layers.map((layer) => (
                      <Button
                        key={layer.id}
                        variant={selectedLayer === layer.id ? 'default' : 'ghost'}
                        className="w-full justify-start text-sm"
                        onClick={() => setSelectedLayer(layer.id)}
                      >
                        {layer.label}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Сетка</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <Icon name={showGrid ? 'Eye' : 'EyeOff'} size={16} />
                    </Button>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Редактор скина</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={uploadSkin}>
                        <Icon name="Upload" size={16} className="mr-1" />
                        Загрузить
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearCanvas}>
                        <Icon name="Trash2" size={16} className="mr-1" />
                        Очистить
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
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
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Превью 3D</h3>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-muted-foreground">
                      <Icon name="Box" size={64} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">3D модель</p>
                      <p className="text-xs mt-1">персонажа</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Палитра</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-12 h-12 cursor-pointer p-1"
                      />
                      <Input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {colors.map((color) => (
                        <button
                          key={color}
                          className="aspect-square rounded border-2 hover:scale-110 transition-transform"
                          style={{ 
                            backgroundColor: color,
                            borderColor: selectedColor === color ? '#9b87f5' : 'transparent'
                          }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Экспорт</h3>
                  <div className="space-y-2">
                    <Button onClick={downloadSkin} className="w-full">
                      <Icon name="Download" size={18} className="mr-2" />
                      Скачать PNG
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Icon name="Share2" size={18} className="mr-2" />
                      Поделиться
                    </Button>
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
