using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class pregunta
{
    public int id { get; set; }

    public string pregunta1 { get; set; } = null!;

    public DateTime fechacreacion { get; set; }

    public string? respuesta { get; set; }

    public DateTime? fecharespuesta { get; set; }

    public virtual ICollection<hacer1> hacer1s { get; set; } = new List<hacer1>();

    public virtual ICollection<hacer2> hacer2s { get; set; } = new List<hacer2>();
}
