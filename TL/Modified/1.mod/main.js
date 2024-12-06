import { using } from "./ModClasses.js";

using("Terraria");
using("Terraria.GameContent");
using("Microsoft.Xna.Framework");
using("Microsoft.Xna.Framework.Graphics");

const Draw =
    SpriteBatch[
        "void Draw(Texture2D texture, Rectangle destinationRectangle, Color color)"
    ];
const Color_Op_Multiply = Color["Color op_Multiply(Color a, float amount)"];

function drawTexture(texture, position, color, rotation, origin, scale) {
    Main.spriteBatch[
        "void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)"
    ](texture, position, null, color, rotation, origin, scale, null, 0.0);
}

import { ModTexture } from "./ModTexture.js";

let SimpleBeam = "";
let Center = "";
let SimpleGlow = "";

Main.Initialize_AlmostEverything.hook((original, self) => {
    original(self);

    SimpleBeam = new ModTexture(`SimpleBeam`).asset.asset.Value;
    Center = new ModTexture(`Center`).asset.asset.Value;
    SimpleGlow = new ModTexture(`SimpleGlow`).asset.asset.Value;
});

function vector(x, y) {
    const vector = Vector2.new();
    vector.X = x;
    vector.Y = y;
    return vector;
}

function rectangle(x, y, width, height) {
    const rectangle = Rectangle.new();
    rectangle.X = x;
    rectangle.Y = y;
    rectangle.Width = width;
    rectangle.Height = height;
    return rectangle;
}

function getRarityColor(rare) {
    switch (rare) {
        case -1:
            return Color.Gray;
        case 0:
            return Color.White;
        case 1:
            return Color.Blue;
        case 2:
            return Color.Green;
        case 3:
            return Color.Orange;
        case 4:
            return Color.Red;
        case 5:
            return Color.Pink;
        case 6:
            return Color.LightPurple;
        case 7:
            return Color.Lime;
        case 8:
            return Color.Yellow;
        case 9:
            return Color.Cyan;
        case 10:
            return Color.Red;
        case 11:
            return Color.Purple;
        default:
            return Color.White;
    }
}

let opacityCycle = 0;

function getOpacity() {
    const cycleValue = Math.sin(opacityCycle * Math.PI);
    return 0.5 + cycleValue * 0.15;
}

Player.UpdateEquips.hook((orig, self, i) => {
    orig(self, i);
    opacityCycle += 0.05;
});

Main.DrawItems.hook((orig, self) => {
    Array.from(Main.item).forEach(item => {
        if (item.active) {
            let centerX = item.Center.X - Main.screenPosition.X;
            let centerY = item.Center.Y - Main.screenPosition.Y;

            const rarityColor = getRarityColor(item.rare);
            const opacity = getOpacity();

            function getOrigin(x, y) {
                return vector(x / 2, y / 2);
            }

            drawTexture(
                SimpleBeam,
                vector(centerX, centerY - 16 * 3),
                Color_Op_Multiply(rarityColor, opacity),
                0,
                getOrigin(6, 144),
                0.75
            );

            if (item.damage > 0) {
                drawTexture(
                    Center,
                    vector(centerX, centerY),
                    Color_Op_Multiply(rarityColor, opacity),
                    0,
                    getOrigin(20, 20),
                    4 + item.Widht
                );
            } else {
                drawTexture(
                    Center,
                    vector(centerX, centerY),
                    Color_Op_Multiply(rarityColor, opacity),
                    0,
                    getOrigin(20, 20),
                    1 + item.Widht
                );
            }

            drawTexture(
                SimpleGlow,
                vector(centerX, centerY),
                Color_Op_Multiply(rarityColor, opacity),
                0,
                getOrigin(150, 150),
                0.35
            );
        }
    });

    orig(self);
});
