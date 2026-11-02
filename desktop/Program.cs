using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Security.Cryptography;
using System.Windows.Forms;

namespace LeleJogos
{
    internal static class Program
    {
        private const string ProductName = "Lelê Jogos";
        // This location is part of the save format: keep it compatible with previous versions.
        private static readonly string DataDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PacienciaLeve");

        [STAThread]
        private static void Main()
        {
            try
            {
                string browser = FindEdge();
                if (browser == null)
                {
                    MessageBox.Show("Instale o Microsoft Edge para executar o Lelê Jogos.",
                        ProductName, MessageBoxButtons.OK, MessageBoxIcon.Information);
                    return;
                }

                Directory.CreateDirectory(DataDirectory);
                string page = Path.Combine(DataDirectory, "index.html");
                byte[] content = ReadEmbeddedGame();
                if (!File.Exists(page) || !SameContent(page, content)) WriteAtomically(page, content);

                var start = new ProcessStartInfo
                {
                    FileName = browser,
                    Arguments = "--app=\"" + new Uri(page).AbsoluteUri + "\" --window-size=1440,960"
                        + " --no-first-run --user-data-dir=\"" + Path.Combine(DataDirectory, "perfil") + "\"",
                    UseShellExecute = false,
                    WorkingDirectory = DataDirectory
                };
                // Edge hosts the installed game in its own app window, without browser tabs.
                Process.Start(start);
            }
            catch (Exception error)
            {
                MessageBox.Show("Não foi possível abrir o Lelê Jogos.\n\n" + error.Message,
                    ProductName, MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static string FindEdge()
        {
            string[] locations = {
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData)
            };
            foreach (string location in locations)
            {
                string candidate = Path.Combine(location, @"Microsoft\Edge\Application\msedge.exe");
                if (File.Exists(candidate)) return candidate;
            }
            return null;
        }

        private static byte[] ReadEmbeddedGame()
        {
            using (Stream resource = Assembly.GetExecutingAssembly().GetManifestResourceStream("Game.html.gz"))
            {
                if (resource == null) throw new InvalidDataException("O conteúdo do aplicativo está incompleto.");
                using (var compressed = new GZipStream(resource, CompressionMode.Decompress))
                using (var buffer = new MemoryStream())
                {
                    compressed.CopyTo(buffer);
                    return buffer.ToArray();
                }
            }
        }

        private static bool SameContent(string path, byte[] content)
        {
            using (var hash = SHA256.Create())
            using (var current = File.OpenRead(path))
            {
                string currentHash = Convert.ToBase64String(hash.ComputeHash(current));
                return currentHash == Convert.ToBase64String(hash.ComputeHash(content));
            }
        }

        private static void WriteAtomically(string path, byte[] content)
        {
            string temporary = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
            try
            {
                File.WriteAllBytes(temporary, content);
                if (File.Exists(path)) File.Replace(temporary, path, null);
                else File.Move(temporary, path);
            }
            finally
            {
                if (File.Exists(temporary)) File.Delete(temporary);
            }
        }
    }
}
